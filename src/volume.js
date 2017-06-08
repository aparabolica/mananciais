'use strict';

var d3 = require('d3');
var _ = require('underscore');

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

		var x = d3.scaleTime().range([0, width]);
		var x2 = d3.scaleTime().range([0, width]);
		var y = d3.scaleLinear().range([height, 220]);

		var area = d3.area()
			.x(function(d) { return volume.svg.x(d.date); })
			.y0(height)
			.y1(function(d) { return volume.svg.y(d.volume); });

		var area_2 = d3.area()
			.x(function(d) { return volume.svg.x(d.date); })
			.y0(height)
			.y1(function(d) { return volume.svg.y(d.volume_indice_2); });

		var area_3 = d3.area()
			.x(function(d) { return volume.svg.x(d.date); })
			.y0(height)
			.y1(function(d) { return volume.svg.y(d.volume_indice_3); });

		volume.svg = {
			x: x,
			x2: x2,
			y: y,
			area: area,
			area_2: area_2,
			area_3: area_3,
			axis: {
				x: d3.axisBottom(x),
				y: d3.axisRight().scale(y).tickSize(width).tickFormat(yAxisFormat)
			},
			node_3: svgContainer.append("path").attr("class", "area volume_3"),
			node_2: svgContainer.append("path").attr("class", "area volume_2"),
			node: svgContainer.append("path").attr("class", "area volume")
		};

		volume.svg.x.domain(d3.extent(data, function(d) { return d.date; }));
		volume.svg.x2.domain(d3.extent(data, function(d) { return d.date; }));
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

	volume.resize = _.debounce(function(width, height, cb) {

		volume.svg.x.range([0, width]);
		volume.svg.x2.range([0, width]);
		volume.svg.y.range([height, 220]);
		volume.svg.axis.y.scale(volume.svg.y).tickSize(width);
		volume.svg.area.y0(height);
		volume.svg.area_2.y0(height);
		volume.svg.area_3.y0(height);

		volume.svg.x.domain(volume.svg.x.domain());
		volume.svg.x2.domain(volume.svg.x2.domain());
		volume.svg.y.domain(volume.svg.y.domain());

		volume.svg.node.datum(volume.data).attr('d', volume.svg.area);
		volume.svg.node_2.datum(volume.data_2).attr('d', volume.svg.area_2);
		volume.svg.node_3.datum(volume.data_3).attr('d', volume.svg.area_3);

		volume.container.select(".x.axis")
			.attr("transform", "translate(0," + height + ")")
			.call(volume.svg.axis.x);

		volume.container.select(".y.axis")
			.call(volume.svg.axis.y)
			.call(axisPosition);

		if(typeof cb == 'function') {
			cb();
		};

	}, 200);

	volume.zoom = function() {
		volume.container.select(".x.axis").call(volume.svg.axis.x);
		volume.svg.node.attr('d', volume.svg.area);
		volume.svg.node_2.attr('d', volume.svg.area_2);
		volume.svg.node_3.attr('d', volume.svg.area_3);
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
