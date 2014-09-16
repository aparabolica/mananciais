'use strict';

var d3 = require('d3'),
	_ = require('underscore'),
	$ = require('jquery'),
	moment = require('moment');

module.exports = function() {

	var stories = {};

	stories.draw = function(data, svgContainer, domain, width, height) {

		stories.tooltip = d3.select("body").append("div").attr("class", "story-content").style("opacity", 0);

		stories.svg = {
			x: {
				value: function(d) { return d.date; },
				scale: d3.time.scale().range([0, width]),
				map: function(d) { return stories.svg.x.scale(stories.svg.x.value(d)); }
			},
			y: {
				value: function(d) {
					var volumeData = _.find(data, function(p) {
						return d.date.unix() == p.date.getTime() / 1000;
					});

					if(volumeData) {
						return volumeData.volume;
					} else {
						return -1000;
					}
				},
				scale: d3.scale.linear().range([height, 220]),
				map: function(d) { return stories.svg.y.scale(stories.svg.y.value(d)) * 0.85; },
				offsetMap: function(d) { return stories.svg.y.scale(stories.svg.y.value(d)); }
			},
			node: svgContainer.append("g").attr("transform", "translate(0,0)").attr("class", "stories")
		};

		$.get('/events', function(data) {

			stories.data = data;
			_.each(stories.data, function(item) {
				item.date = moment(item.data, 'DD/MM/YYYY');
			});			

			stories.svg.x.scale.domain(domain.x.domain());
			stories.svg.y.scale.domain(domain.y.domain());

			stories.svg.node
				.selectAll('line')
				.data(stories.data)
					.enter().append('line')
					.attr("x1", stories.svg.x.map)
					.attr("y1", stories.svg.y.map)
					.attr("x2", stories.svg.x.map)
					.attr("y2", stories.svg.y.offsetMap)
					.attr('class', 'story-line')
					.style({stroke: '#fc0', 'stroke-width': '1px', 'stroke-opacity': .5});

			stories.svg.node
				.selectAll(".story")
				.data(stories.data)
					.enter().append("circle")
					.attr("class", "story")
					.attr("r", 5)
					.attr("cx", stories.svg.x.map)
					.attr("cy", stories.svg.y.map)
					.on("mouseover", function(d) {
						stories.tooltip.transition()
							.duration(200)
							.style("opacity", 1);

							stories.tooltip.html('<p class="date">' + d.date.format('DD/MM/YYYY') + '</p><h3>' + d.titulo + '</h3>')
							.style("left", (d3.event.pageX) + "px")
							.style("top", (d3.event.pageY) + "px");
					})
					.on("mousemove", function(d) {
						stories.tooltip
							.style("left", (d3.event.pageX) + "px")
							.style("top", (d3.event.pageY) + "px");
					})
					.on("mouseout", function(d) {
						stories.tooltip.transition()
							.duration(500)
							.style("opacity", 0);
					});
			}, 'json');

		return stories;

	};

	stories.brush = function(extent) {

		stories.svg.x.scale.domain(extent);

		stories.svg.node
			.selectAll(".story")
			.attr("cx", stories.svg.x.map)
			.attr("cy", stories.svg.y.map);

		stories.svg.node
			.selectAll(".stories line")
			.attr("x1", stories.svg.x.map)
			.attr("y1", stories.svg.y.map)
			.attr("x2", stories.svg.x.map)
			.attr("y2", stories.svg.y.offsetMap);

	}

	stories.updateData = function(data) {

		stories.svg.y.value = function(d) {
			var volumeData = _.find(data, function(p) {
				return d.date.unix() == p.date.getTime() / 1000;
			});

			if(volumeData) {
				return volumeData.volume;
			} else {
				return -1000;
			}
		};

		stories.svg.node
			.selectAll(".story")
			.transition()
			.duration(2000)
			.attr("cy", stories.svg.y.map);

		stories.svg.node
			.selectAll('line')
			.transition()
			.duration(2000)
			.attr("y1", stories.svg.y.map)
			.attr("y2", stories.svg.y.offsetMap);

	}

	return stories;

};