'use strict';

var d3 = require('d3');
var _ = require('underscore');
var moment = require('moment');
var $ = require('jquery');

module.exports = function(filter) {

  var compare = {};

  var Data;
  var End;
  var Start;

  compare.get = function(end, start) {

    End = end ? moment(end) : moment(_.last(filter.data).date);
    Start = start ? moment(start) : end.clone().subtract(30, 'days');

    var yearRange = [];

    _.each(filter.data, function(item) {
      if(yearRange.indexOf(item.date.getFullYear()) == -1) {
        yearRange.push(item.date.getFullYear());
      }
    });

    yearRange.reverse();

    var variations = [];
    _.each(yearRange, function(year) {
      var s = Start.clone().year(year);
      var e = End.clone().year(year);
      variations.push({
        year: year,
        variation: filter.getVariation([s.toDate(), e.toDate()])
      });
    });

    return variations;

  };

  compare.draw = function(end, start) {

    var end = end ? moment(end) : moment(_.last(filter.data).date);
    var start = start ? moment(start) : end.clone().subtract(30, 'days');

    Data = compare.get(end, start);

    var $container = $('#compare-table');

    var volumeText = 'Volume em ' + end.format('DD/MM');

    $container.empty();
    $container.append('<table><thead><tr><th>Ano</th><th>' + volumeText + '</th><th>Variação de volume nos 30 dias anteriores</th><th>Pluviometria acumulada dos 30 dias anteriores</th></tr></head><tbody></tbody></table>');

    _.each(Data, function(yearData) {
      $container.find('tbody').append('<tr><td class="year">' + yearData.year + '</td><td class="volume">' + lastVolume(yearData.variation) + '</td><td>' + parseVolume(yearData.variation.volume) + '</td><td>' + parseRain(yearData.variation.pluviometria) + '</td></tr>');
    });


  };

  compare.chart = function() {

    var data = _.sortBy(Data.slice(0), function(d) {
      return d.year;
    });

    var $container = $('#compare-chart');

    $container.empty();

    var tooltip = d3.select($container[0])
      .append("div")
        .attr("class", "compare-tooltip")
        .style("opacity", 0);


    var margin = {
      top: 20,
      right: 20,
      bottom: 40,
      left: 30
    };

    var width = $container.width() - margin.left - margin.right;
    var height = 400 - margin.top - margin.bottom;

    var x = d3.time.scale().range([0, width]);
    var y = d3.scale.linear().range([height, 0]);
    var s = d3.scale.linear().range([3, 12]);

    var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

    var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left");

    var xValue = function(d) { return End.clone().year(d.year).toDate(); };
    var yValue = function(d) { return _.last(d.variation.data).volume; };
    var sValue = function(d) { return parseFloat(d.variation.pluviometria); };

    var line = d3.svg.line()
      .interpolate('linear')
      .x(function(d) { return x(xValue(d)); })
      .y(function(d) { return y(yValue(d)); });

    x.domain(d3.extent(data, xValue));
    y.domain(d3.extent(data, yValue));
    s.domain(d3.extent(data, sValue));

    var svg = d3.select($container[0])
      .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
      .append('g')
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Volume");

    svg.append('path')
      .datum(data)
      .attr('class', 'line')
      .attr('d', line);

    var circle = svg.selectAll('circle')
      .data(data);

    circle.enter().append('circle')
      .attr("r", function(d) { return s(sValue(d)); })
      .attr("cx", function(d) { return x(xValue(d)); })
      .attr("cy", function(d) { return y(yValue(d)); })
      .on('mouseover', function(d) {
        tooltip.transition()
          .duration(200)
          .style("opacity", 1);

        var last = _.last(d.variation.data);

        var title = '<h3>' + moment(last.date).format('LL') + '</h3>';
        var volume = '<p class="volume"><span>' + last.volume.toFixed(1) + ' %</span> de volume armazenado</p>';
        var pluv = '<p class="pluviometria"><strong>' + d.variation.pluviometria + ' mm</strong> de pluviometria acumulada nos 30 dias anteriores</p>';

        tooltip.html(title + volume + pluv);

      })
      .on("mousemove", function(d) {
        tooltip
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY) + "px");
      })
      .on("mouseout", function(d) {
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      });
  }

  function getFirstVolume(yearData) {

  }

  function lastVolume(yearData) {
    return '<span class="absolute-volume">' + _.last(yearData.data).volume.toFixed(1) + ' %</span>';
  }

  function parseVolume(volume) {
    var c = 'negative';
    if(volume > 0) {
      volume = '+' + volume;
      c = 'positive';
    }
    return '<span class="volume ' + c + '">' + volume + ' %</span>';
  }

  function parseRain(rain) {
    return '<span class="pluviometria">' + rain + ' mm</span>';
  }

  return compare;

};
