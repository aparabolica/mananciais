'use strict';

var d3 = require('d3');

var timeFormat = d3.time.format.multi([
	["%a %d", function(d) { return d.getMilliseconds(); }],
	["%a %d", function(d) { return d.getSeconds(); }],
	["%a %d", function(d) { return d.getMinutes(); }],
	["%a %d", function(d) { return d.getHours(); }],
	["%a %d", function(d) { return d.getDay() && d.getDate() != 1; }],
	["%b %d", function(d) { return d.getDate() != 1; }],
	["%B", function(d) { return d.getMonth(); }],
	["%Y", function() { return true; }]
]);

var yAxisFormat = function(d) {
	return d === 100 ? d + '% de volume armazenado' : d + '%';
};

var axisPosition = function(g) {
	g.selectAll('text').attr('x', 4).attr('dy', -4);
};

module.exports = function() {

	var volume = {};

	var container;

	volume.draw = function(data, svgContainer, width, height) {

		container = svgContainer;

		volume.data = data;

		var x = d3.time.scale().range([0, width]);
		var y = d3.scale.linear().range([height, 220]);
		var area = d3.svg.area()
			.interpolate("monotone")
			.x(function(d) { return volume.svg.x(d.date); })
			.y0(height)
			.y1(function(d) { return volume.svg.y(d.volume); });

		volume.svg = {
			x: x,
			y: y,
			area: area,
			axis: {
				x: d3.svg.axis().scale(x).tickFormat(timeFormat).orient("bottom"),
				y: d3.svg.axis().scale(y).tickSize(width).tickFormat(yAxisFormat).orient("right")
			},
			node: svgContainer.append("path").attr("class", "area volume")
		};

		volume.svg.x.domain(d3.extent(data, function(d) { return d.date; }));
		volume.svg.y.domain([0, d3.max(data, function(d) { return d.volume; })]);

		volume.svg.node
			.datum(data)
			.attr('d', area);

		svgContainer
			.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(volume.svg.axis.x);

		svgContainer
			.append("g")
			.attr("class", "y axis")
			.call(volume.svg.axis.y)
			.call(axisPosition);

	};

	// Under development
	volume.resize = function(width, height) {

		volume.svg.x = d3.time.scale().range([0, width]);
		volume.svg.y = d3.scale.linear().range([height, 220]);
		volume.svg.axis.y = d3.svg.axis().scale(volume.svg.y).tickSize(width).tickFormat(yAxisFormat).orient("right");
		volume.svg.area.y0(height);

		//volume.svg.x.domain(volume.svg.x.domain());
		//volume.svg.y.domain(volume.svg.y.domain());

		//volume.svg.node.datum(volume.data).attr('d', volume.svg.area);

		container.select(".x.axis").attr("transform", "translate(0," + height + ")").call(volume.svg.axis.x);
		container.select(".y.axis").call(volume.svg.axis.y).call(axisPosition);

	};

	volume.brush = function(extent) {

		volume.svg.x.domain(extent);
		volume.svg.node.attr("d", volume.svg.area);
		container.select(".x.axis").call(volume.svg.axis.x);

	};

	volume.updateData = function(data) {

		volume.data = data;

		volume.svg.node.datum(data).transition().duration(2000).attr("d", volume.svg.area);
		container.select(".x.axis").call(volume.svg.axis.x);

	};

	return volume;

};