"use strict";

var d3 = require("d3"),
  icons = require("./icons"),
  _ = require("underscore");

module.exports = function() {
  var pluviometria = {};

  pluviometria.draw = function(data, svgContainer, domain, width, height) {
    pluviometria.tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    pluviometria.svg = {
      x: {
        value: function(d) {
          return d.date;
        },
        scale: d3.scaleTime().range([0, width]),
        map: function(d) {
          return pluviometria.svg.x.scale(pluviometria.svg.x.value(d));
        }
      },
      y: {
        value: function(d) {
          return d.volume;
        },
        scale: d3.scaleLinear().range([height, 220]),
        map: function(d) {
          return pluviometria.svg.y.scale(pluviometria.svg.y.value(d));
        }
      },
      s: {
        value: function(d) {
          return d.pluviometria;
        },
        scale: d3.scaleLinear().range([0, 10]),
        map: function(d) {
          return pluviometria.svg.s.scale(pluviometria.svg.s.value(d));
        }
      },
      node: svgContainer
        .append("g")
        .attr("transform", "translate(0,0)")
        .attr("class", "pluviometria"),
      domain: domain
    };

    pluviometria.svg.x.scale.domain(domain.svg.x.domain());
    pluviometria.svg.y.scale.domain(domain.svg.y.domain());
    pluviometria.svg.s.scale.domain(
      d3.extent(data, function(d) {
        return d.pluviometria;
      })
    );

    pluviometria.svg.node
      .selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("r", pluviometria.svg.s.map)
      .attr("cx", pluviometria.svg.x.map)
      .attr("cy", pluviometria.svg.y.map)
      .on("mouseover", function(d) {
        pluviometria.tooltip
          .transition()
          .duration(200)
          .style("opacity", 1);

        pluviometria.tooltip
          .html(icons.rain + d.pluviometria + "mm")
          .style("left", pluviometria.svg.x.map(d) + 20 + "px")
          .style("top", pluviometria.svg.y.map(d) + "px");
      })
      .on("mouseout", function(d) {
        pluviometria.tooltip
          .transition()
          .duration(500)
          .style("opacity", 0);
      });
  };

  pluviometria.resize = _.debounce(function(width, height) {
    pluviometria.svg.x.scale.range([0, width]);
    pluviometria.svg.y.scale.range([height, 220]);
    pluviometria.svg.y.scale.domain(pluviometria.svg.domain.svg.y.domain());
    var extent = pluviometria.svg.domain.svg.x.domain();
    pluviometria.zoom(extent);
  }, 200);

  pluviometria.hide = function() {
    if (!pluviometria.hidden) {
      pluviometria.svg.node.style("opacity", 0);
      pluviometria.hidden = true;
    }
  };

  pluviometria.zoom = function(extent) {
    pluviometria.hidden = false;
    pluviometria.svg.node.style("opacity", 1);
    pluviometria.svg.x.scale.domain(extent);
    pluviometria.svg.node
      .selectAll(".dot")
      .attr("cx", pluviometria.svg.x.map)
      .attr("cy", pluviometria.svg.y.map);
  };

  pluviometria.updateData = function(data) {
    pluviometria.svg.node
      .selectAll(".dot")
      .data(data)
      .transition()
      .duration(2000)
      .attr("class", "dot")
      .attr("r", pluviometria.svg.s.map)
      .attr("cx", pluviometria.svg.x.map)
      .attr("cy", pluviometria.svg.y.map);
  };

  return pluviometria;
};
