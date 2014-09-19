'use strict';

var d3 = require('d3'),
	icons = require('./icons');

module.exports = function() {

	var pluviometria = {};

	pluviometria.draw = function(data, svgContainer, domain, width, height) {

		pluviometria.tooltip = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);

		pluviometria.svg = {
			x: {
				value: function(d) { return d.date; },
				scale: d3.time.scale().range([0, width]),
				map: function(d) { return pluviometria.svg.x.scale(pluviometria.svg.x.value(d)); }
			},
			y: {
				value: function(d) { return d.volume; },
				scale: d3.scale.linear().range([height, 220]),
				map: function(d) { return pluviometria.svg.y.scale(pluviometria.svg.y.value(d)); }
			},
			s: {
				value: function(d) { return d.pluviometria; },
				scale: d3.scale.linear().range([0, 10]),
				map: function(d) { return pluviometria.svg.s.scale(pluviometria.svg.s.value(d)); }
			},
			node: svgContainer.append("g").attr("transform", "translate(0,0)").attr("class", "pluviometria")
		};

		pluviometria.svg.x.scale.domain(domain.svg.x.domain());
		pluviometria.svg.y.scale.domain(domain.svg.y.domain());
		pluviometria.svg.s.scale.domain(d3.extent(data, function(d) { return d.pluviometria; }));

		pluviometria.svg.node
			.selectAll(".dot")
			.data(data)
				.enter().append("circle")
				.attr("class", "dot")
				.attr("r", pluviometria.svg.s.map)
				.attr("cx", pluviometria.svg.x.map)
				.attr("cy", pluviometria.svg.y.map)
				.on("mouseover", function(d) {
					pluviometria.tooltip.transition()
						.duration(200)
						.style("opacity", 1);
				
						pluviometria.tooltip.html(icons.rain + d.pluviometria + "mm")
						.style("left", (d3.event.pageX) + "px")
						.style("top", (d3.event.pageY) + "px");
				})
				.on("mousemove", function(d) {
					pluviometria.tooltip
						.style("left", (d3.event.pageX) + "px")
						.style("top", (d3.event.pageY) + "px");
				})
				.on("mouseout", function(d) {
					pluviometria.tooltip.transition()
						.duration(500)
						.style("opacity", 0);
				});


	};

	pluviometria.hide = function() {
		pluviometria.svg.node.style({'display': 'none'});
	};

	pluviometria.brush = function(extent) {

		pluviometria.svg.node.style({'display': 'block'});

		pluviometria.svg.x.scale.domain(extent);

		pluviometria.redraw();

	};

	pluviometria.redraw = function() {

		pluviometria.svg.node
			.selectAll(".dot")
			.attr("r", pluviometria.svg.s.map)
			.attr("cx", pluviometria.svg.x.map)
			.attr("cy", pluviometria.svg.y.map);
	}

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