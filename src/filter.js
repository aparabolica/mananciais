'use strict';

var d3 = require('d3'),
	_ = require('underscore'),
	$ = require('jquery'),
	moment = require('moment'),
	icons = require('./icons');

var settings;

module.exports = {
	init: function(options) {

		settings = _.extend({
			margin: {
				top: 20,
				left: 20,
				right: 20,
				bottom: 20
			}
			svg: null,
			data: {},
			callback : null
		}, options);

		var filter = {};
		
		filter.x = d3.time.scale()
			.range([0, filterWidth]);
		filter.y = d3.scale.linear()
			.range([filterHeight, 0]);
		filter.area = d3.svg.area()
			.interpolate("monotone")
			.x(function(d) { return filter.x(d.date); })
			.y0(filterHeight)
			.y1(function(d) { return filter.y(d.volume); });
		filter.xAxis = d3.svg.axis()
			.scale(filter.x)
			.orient("bottom");

		var brush = d3.svg.brush().x(filter.x).on("brush", brushed);

	},
	update: function(data) {



	}
}

function brushed(callback) {



}