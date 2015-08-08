'use strict';

var d3 = require('d3');
var _ = require('underscore');

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

	volume.draw = function(data, svgContainer, width, height) {

		volume.container = svgContainer;

		volume.data = data;

		volume.data_2 = _.filter(data, function(d) { return d.volume_indice_2; });
		volume.data_3 = _.filter(data, function(d) { return d.volume_indice_3; });

		var x = d3.time.scale().range([0, width]);
		var y = d3.scale.linear().range([height, 220]);

		var area = d3.svg.area()
			.x(function(d) { return volume.svg.x(d.date); })
			.y0(height)
			.y1(function(d) { return volume.svg.y(d.volume); });

		var area_2 = d3.svg.area()
			.x(function(d) { return volume.svg.x(d.date); })
			.y0(height)
			.y1(function(d) { return volume.svg.y(d.volume_indice_2); });

		var area_3 = d3.svg.area()
			.x(function(d) { return volume.svg.x(d.date); })
			.y0(height)
			.y1(function(d) { return volume.svg.y(d.volume_indice_3); });

		volume.svg = {
			x: x,
			y: y,
			area: area,
			area_2: area_2,
			area_3: area_3,
			axis: {
				x: d3.svg.axis().scale(x).tickFormat(timeFormat).orient("bottom"),
				y: d3.svg.axis().scale(y).tickSize(width).tickFormat(yAxisFormat).orient("right")
			},
			node_2: svgContainer.append("path").attr("class", "area volume_2"),
			node_3: svgContainer.append("path").attr("class", "area volume_3"),
			node: svgContainer.append("path").attr("class", "area volume")
		};

		volume.svg.x.domain(d3.extent(data, function(d) { return d.date; }));
		volume.svg.y.domain([0, d3.max(data, function(d) { return d.volume; })]);

		volume.svg.node
			.datum(data)
			.attr('d', area);

		volume.svg.node_2
			.datum(volume.data_2)
			.attr('d', area_2);

		volume.svg.node_3
			.datum(volume.data_3)
			.attr('d', area_3);

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

		volume.container.select(".x.axis").attr("transform", "translate(0," + height + ")").call(volume.svg.axis.x);
		volume.container.select(".y.axis").call(volume.svg.axis.y).call(axisPosition);

	};

	volume.brush = function(extent) {

		volume.svg.x.domain(extent);
		volume.redraw();

	};

	volume.redraw = function() {

		volume.svg.node.attr("d", volume.svg.area);
		volume.svg.node_2.attr("d", volume.svg.area_2);
		volume.svg.node_3.attr("d", volume.svg.area_3);
		volume.container.select(".x.axis").call(volume.svg.axis.x);

	};

	volume.updateData = function(data) {

		volume.data = data;

		volume.data_2 = _.filter(data, function(d) { return d.volume_indice_2; });
		volume.data_3 = _.filter(data, function(d) { return d.volume_indice_3; });

		volume.container.select(".x.axis").call(volume.svg.axis.x);
		volume.svg.node.datum(data).transition().duration(2000).attr("d", volume.svg.area);
		volume.svg.node_2.datum(volume.data_2).transition().duration(2000).attr("d", volume.svg.area_2);
		volume.svg.node_3.datum(volume.data_3).transition().duration(2000).attr("d", volume.svg.area_3);

	};

	return volume;

};
