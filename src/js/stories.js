"use strict";

var d3 = require("d3"),
  _ = require("underscore"),
  $ = require("jquery"),
  moment = require("moment");

module.exports = function(info) {
  var stories = {};

  var container;

  stories.draw = function(data, svgContainer, domain, width, height) {
    container = svgContainer;

    stories.tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "story-content")
      .style("opacity", 0);

    stories.svg = {
      x: {
        value: function(d) {
          return d.date;
        },
        scale: d3.scaleTime().range([0, width]),
        map: function(d) {
          return stories.svg.x.scale(stories.svg.x.value(d));
        }
      },
      y: {
        value: function(d) {
          var unix = d.date.unix();
          var volumeData = _.find(data, function(p) {
            return unix == p.date.getTime() / 1000;
          });

          if (volumeData) {
            return volumeData.volume;
          } else {
            return -1000;
          }
        },
        scale: d3.scaleLinear().range([height, 220]),
        map: function(d) {
          return stories.svg.y.scale(stories.svg.y.value(d)) * 0.85;
        },
        offsetMap: function(d) {
          return stories.svg.y.scale(stories.svg.y.value(d));
        }
      },
      node: svgContainer
        .append("g")
        .attr("transform", "translate(0,0)")
        .attr("class", "stories"),
      domain: domain
    };

    $.get(
      "/stories",
      function(data) {
        stories.data = data;
        _.each(stories.data, function(item) {
          item.date = moment(item.data, "DD/MM/YYYY");
        });

        stories.svg.x.scale.domain(domain.svg.x.domain());
        stories.svg.y.scale.domain(domain.svg.y.domain());

        stories._draw(stories.data, true);
      },
      "json"
    );

    var line = svgContainer.select(".selection-line");

    $("#stories").on("mouseenter", "article", function() {
      var story = $(this).data("story");
      line.style("stroke", "#ffe86e");
      line
        .attr("opacity", 1)
        .attr("x1", story._cx)
        .attr("x2", story._cx);
      var dateFormatted = story.date.format("YYYY-M-D");
      var volume = _.find(data, function(v) {
        return v.data == dateFormatted;
      });
      info.update(volume);
    });

    $("#stories").on("mouseleave", "article", function() {
      line.style("stroke", "#fff");
      line.attr("opacity", 0);
    });

    return stories;
  };

  stories.resize = _.debounce(function(width, height) {
    stories.svg.x.scale.range([0, width]);
    stories.svg.y.scale.range([height, 220]);
    stories.svg.x.scale.domain(stories.svg.domain.svg.x.domain());
    stories.svg.y.scale.domain(stories.svg.domain.svg.y.domain());
    stories._draw(stories.filteredData || stories.data, false);
  }, 200);

  stories.hide = function() {
    stories.svg.node.style("display", "none");
  };

  stories._draw = function(data, resetList) {
    /*
		 * Sidebar stories
		 */

    if (resetList) {
      var data = _.sortBy(data, function(s) {
        return -s.date;
      });

      var $container = $("#stories .stories-list");
      $container.empty();
      _.each(data, function(story) {
        var $node = $("<li />");
        var $article = $("<article />");
        var $meta = $('<p class="meta" />');
        $meta.append('<span class="date">' + story.data + "</span>");
        $meta.append('<span class="type">' + story.tipo + "</span>");
        $article.append($meta);
        $article.append(
          '<h3><a href="' +
            story.url +
            '" title="' +
            story.titulo +
            '" target="_blank" rel="external">' +
            story.titulo +
            "</a></h3>"
        );
        $article.append("<p>" + story.descricao + "</p>");
        $article.data("story", story);
        $container.append($node.append($article));
      });
    }

    /*
		 * Chart
		 */

    var clusters = clusterize(data);

    stories.svg.node.selectAll("line").remove();
    stories.svg.node.selectAll(".story").remove();

    stories.svg.node
      .selectAll("line")
      .data(clusters)
      .enter()
      .append("line")
      .attr("x1", function(d) {
        return d.cx;
      })
      .attr("y1", function(d) {
        return d.cy;
      })
      .attr("x2", function(d) {
        return d.cx;
      })
      .attr("y2", function(d) {
        return d.cyO;
      })
      .attr("class", "story-line")
      .style("stroke", "#fc0")
      .style("stroke-width", "1px")
      .style("stroke-opacity", 0.5);

    var hasFixed = false;

    container.on("click", function() {
      if (hasFixed) {
        _.each(clusters, function(c) {
          c.fixed = false;
        });
        stories.tooltip
          .transition()
          .duration(500)
          .style("pointer-events", "none")
          .style("opacity", 0);
      }
      hasFixed = false;
    });

    stories.svg.node
      .selectAll(".story")
      .data(clusters)
      .enter()
      .append("circle")
      .attr("class", function(d) {
        var c = "story";
        if (d.stories.length > 1) {
          c += " cluster";
        }
        return c;
      })
      .attr("r", 5)
      .attr("cx", function(d) {
        return d.cx;
      })
      .attr("cy", function(d) {
        return d.cy;
      })
      .on("click", function(d) {
        if (d.stories.length == 1) {
          if (d.stories[0].url) {
            window.open(d.stories[0].url, "_blank");
          }
        } else {
          if (d.fixed) {
            d.fixed = false;
            stories.tooltip.html("<h3>" + d.titulo + "</h3>");
            stories.tooltip.attr("class", "story-content cluster");
          } else {
            setTimeout(function() {
              hasFixed = true;
              d.fixed = true;
              stories.tooltip.style("opacity", 1);
              var html = "<ul>";
              _.each(d.stories, function(s) {
                html +=
                  "<li><span>" +
                  s.data +
                  " | " +
                  s.tipo +
                  '</span><h3><a href="' +
                  s.url +
                  '" target="_blank">' +
                  s.titulo +
                  "</a></h3></li>";
              });
              html += "</ul>";
              stories.tooltip
                .attr("class", "story-content opened")
                .style("pointer-events", "auto")
                .html(html);
            }, 100);
          }
        }
      })
      .on("mouseover", function(d) {
        if (!d.fixed) {
          var removeFixed = _.filter(clusters, function(dF) {
            return dF !== d;
          });
          _.each(removeFixed, function(dF) {
            dF.fixed = false;
          });
          hasFixed = false;

          stories.tooltip
            .attr("class", function() {
              var c = "story-content";
              if (d.stories.length > 1) {
                c += " cluster";
              }
              return c;
            })
            .style("opacity", 1);

          if (d.stories.length > 1) {
            stories.tooltip.html("<h3>" + d.titulo + "</h3>");
          } else {
            stories.tooltip.html(
              "<span>" +
                d.stories[0].data +
                " | " +
                d.stories[0].tipo +
                "</span><h3>" +
                d.titulo +
                "</h3>"
            );
          }

          stories.tooltip.style("left", d.cx + "px").style("top", d.cy + "px");
        }
      })
      .on("mouseout", function(d) {
        if (!d.fixed) {
          stories.tooltip
            .transition()
            .duration(500)
            .style("pointer-events", "none")
            .style("opacity", 0);
        }
      });
  };

  stories.preBrush = function(extent) {
    stories.svg.x.scale.domain(extent);
    stories.svg.node
      .selectAll("line")
      .attr("x1", function(d) {
        return getClusterCoords(d.stories).cx;
      })
      .attr("y1", function(d) {
        return getClusterCoords(d.stories).cy;
      })
      .attr("x2", function(d) {
        return getClusterCoords(d.stories).cx;
      })
      .attr("y2", function(d) {
        return getClusterCoords(d.stories).cyO;
      });
    stories.svg.node
      .selectAll(".story")
      .attr("cx", function(d) {
        return getClusterCoords(d.stories).cx;
      })
      .attr("cy", function(d) {
        return getClusterCoords(d.stories).cy;
      });
  };

  stories.hide = function() {
    if (!stories.hidden) {
      stories.svg.node.style("opacity", 0);
      stories.hidden = true;
    }
  };

  stories.zoom = function(extent) {
    stories.hidden = false;
    stories.svg.node.style("opacity", 1);
    stories.svg.node.style("display", "block");
    stories.svg.x.scale.domain(extent);
    stories._draw(stories.data, false);
  };

  stories.updateData = function(data, manancial) {
    stories.svg.y.value = function(d) {
      var volumeData = _.find(data, function(p) {
        return d.date.unix() == p.date.getTime() / 1000;
      });

      if (volumeData) {
        return volumeData.volume;
      } else {
        return -1000;
      }
    };

    stories.filteredData = _.filter(stories.data, function(s) {
      return s.manancial.trim() == manancial || s.manancial.trim() == "todos";
    });

    stories._draw(stories.filteredData, true);
  };

  function clusterize(data) {
    var sorted = _.sortBy(data, function(d) {
      return -stories.svg.x.scale(stories.svg.x.value(d));
    });

    var groups = [];

    var prevVal;
    var i = 0;
    _.each(sorted, function(d) {
      d._cx = stories.svg.x.scale(stories.svg.x.value(d));
      d._cy = stories.svg.y.scale(stories.svg.y.value(d)) * 0.9;
      d._cyO = stories.svg.y.scale(stories.svg.y.value(d));
      if (prevVal - d._cx <= 10) {
        if (!groups[i].length) {
          groups[i] = [];
        }

        groups[i].push(d);
      } else {
        i++;
        groups[i] = [d];
      }
      prevVal = d._cx;
    });

    groups = _.compact(groups);

    var clusters = [];

    _.each(groups, function(group) {
      var title = group.length + " histórias";

      if (group.length == 1) {
        title = group[0].titulo;
      }

      clusters.push(
        _.extend(
          {
            titulo: title,
            stories: group
          },
          getClusterCoords(group)
        )
      );
    });

    return clusters;
  }

  function getClusterCoords(group) {
    // This is very expensive.
    _.each(group, function(story) {
      story._cx = stories.svg.x.scale(stories.svg.x.value(story));
      story._cy = stories.svg.y.scale(stories.svg.y.value(story)) * 0.9;
      story._cyO = stories.svg.y.scale(stories.svg.y.value(story));
    });

    return {
      cx: group[0]._cx,
      cy: group[0]._cy,
      cyO: group[0]._cyO
    };

    // This is even more.
    // var cx = _.map(group, function(c) { return c._cx; }).reduce(function(prev, cur) { return prev + cur; }) / group.length;
    // var cy = _.map(group, function(c) { return c._cy; }).reduce(function(prev, cur) { return prev + cur; }) / group.length;
    // var cyO = _.map(group, function(c) { return c._cyO; }).reduce(function(prev, cur) { return prev + cur; }) / group.length;
    //
    // return {
    // 	cx: cx,
    // 	cy: cy,
    // 	cyO: cyO
    // };
  }

  return stories;
};
