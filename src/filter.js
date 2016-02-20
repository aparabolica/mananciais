'use strict';

var d3 = require('d3'),
	icons = require('./icons'),
	_ = require('underscore'),
	$ = require('jquery'),
	moment = require('moment');

module.exports = function(brushedCb) {

	var filter = {};

	var resultsTmpl = '';
	resultsTmpl += '<p class="volume">' + icons.water + '<span class="val"></span> <span class="label">de variação de volume</span></p>';
	resultsTmpl += '<p class="pluviometria">' + icons.rain + '<span class="val"></span> <span class="label">de pluviometria acumulada</span></p>';

	filter.draw = function(data, svgContainer, width, height, margin) {

		filter.data = data;

		filter.margin = margin;

		filter.positions = getPositions(width, height, margin);

		$('#filter').css({
			'position': 'absolute',
			'top': filter.positions.margin.top,
			'left': filter.positions.width + 40,
			'width': filter.positions.margin.right,
			'height': filter.positions.height
		});
		$('#filter .filter-result').hide().append($(resultsTmpl));

		filter.svg = getSvg(svgContainer);

		filter.brush = d3.svg.brush().x(filter.svg.x).on("brush", _.debounce(brushed, 200));

		filter.svg.x.domain(d3.extent(data, function(d) { return d.date; }));
		filter.svg.y.domain([0, d3.max(data, function(d) { return d.volume; })]);

		filter.context = filter.svg.node.append("path")
			.datum(data)
			.attr('transform', 'scale(1, 0.7)')
			.attr("class", "area volume")
			.attr("d", filter.svg.area);

		filter.svg.node.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + (filter.positions.height - 20) + ")")
			.call(filter.svg.axis.x);

		filter.svg.node.append("g")
			.attr("class", "x brush")
			.call(filter.brush)
			.selectAll("rect")
			.attr("y", 1)
			.attr("height", filter.positions.height - 2);

		var selection = _.last(data);

		$('#filter').show();
		filterInfo([moment(selection.date).subtract(7, 'days').toDate(), moment(selection.date).toDate()]);

	}

	filter.resize = _.debounce(function(width, height, margin) {

		filter.positions = getPositions(width, height, margin);

		$('#filter').css({
			'position': 'absolute',
			'top': filter.positions.margin.top,
			'left': filter.positions.width + 40,
			'width': filter.positions.margin.right,
			'height': filter.positions.height
		});

		filter.svg.x.range([0, filter.positions.width]);
		filter.svg.y.range([filter.positions.height, 0]);

		filter.brush.x(filter.svg.x);

		filter.svg.area.y0(filter.positions.height);

		filter.svg.node.select('.x.axis').attr("transform", "translate(0," + (filter.positions.height - 20) + ")");
		filter.svg.node.select('.x.brush').attr("height", filter.positions.height - 2);

		$('.filter-area-container')
			.attr("transform", "translate(" + filter.positions.margin.left + "," + filter.positions.margin.top + ")")
			.attr('width', filter.positions.width)
			.attr('height', filter.positions.height);

		$('.filter-area-svg')
			.attr('width', filter.positions.width)
			.attr('height', filter.positions.height);

		filter.redraw();

	}, 200);

	filter.brushArea = function(extent) {

		filter.svg.x.domain(extent);
		filter.redraw();

	};

	filter.redraw = function() {

		filter.context.attr("d", filter.svg.area);
		filter.svg.node.select('.x.axis').call(filter.svg.axis.x);

	};

	filter.updateData = function(data) {

		var selection = _.last(data);

		filter.context.datum(data).transition().duration(2000).attr("d", filter.svg.area);
		filter.svg.node.select(".x.axis").call(filter.svg.axis.x);

		$('#filter').show();
		filterInfo([moment(selection.date).subtract(7, 'days').toDate(), moment(selection.date).toDate()]);

	}

	function getPositions(width, height, margin) {

		var filterMargin = {
			top: height + 60,
			right: width * .6,
			bottom: 40,
			left: 20
		};

		return {
			width: width - filterMargin.right - filterMargin.left,
			height: margin.bottom - 130,
			margin: filterMargin
		}

	}

	function getSvg(container) {

		var x = d3.time.scale().range([0, filter.positions.width]);
		var y = d3.scale.linear().range([filter.positions.height, 0]);
		var area = d3.svg.area()
			.interpolate("monotone")
			.x(function(d) { return filter.svg.x(d.date); })
			.y0(filter.positions.height)
			.y1(function(d) { return filter.svg.y(d.volume); });

		var node = container.append('foreignObject')
			.attr('class', 'filter-area-container')
			.attr("transform", "translate(" + filter.positions.margin.left + "," + filter.positions.margin.top + ")")
			.attr('width', filter.positions.width)
			.attr('height', filter.positions.height)
			.append('svg')
				.attr('class', 'filter-area-svg')
				.attr('width', filter.positions.width)
				.attr('height', filter.positions.height)
				.style({'overflow': 'hidden'})
				.append("g")
					.attr("class", "context");

		return {
			x: x,
			y: y,
			area: area,
			axis: {
				x: d3.svg.axis().scale(x).orient("bottom")
			},
			node: node
		};

	}

	function brushed() {

		var extent = filter.brush.empty() ? filter.svg.x.domain() : filter.brush.extent();

		var first = moment(filter.data[0].date).toDate();
		var last = moment(_.last(filter.data).date).toDate();

		if(extent[0] < first) {
			extent[0] = first;
		}

		if(extent[1] > last) {
			extent[1] = last;
		}

		if(!filter.brush.empty())
			filterInfo(extent);
		else
			filterInfo([moment(_.last(filter.data).date).subtract(7, 'days').toDate(), _.last(filter.data).date]);

		if(typeof brushedCb == 'function')
			brushedCb(extent);

	}

	function filterInfo(extent) {
		var variation = getVariation(extent);

		$('#filter .filter-input .start').val(moment(extent[0]).format('DD/MM/YYYY'));
		$('#filter .filter-input .end').val(moment(extent[1]).format('DD/MM/YYYY'));

		if(variation.volume > 0) {
			variation.volume = '+' + variation.volume;
			$('#filter .filter-result .volume').addClass('positive');
		} else {
			$('#filter .filter-result .volume').removeClass('positive');
		}
		$('#filter .filter-result .volume .val').text(variation.volume + ' %');
		$('#filter .filter-result .pluviometria .val').text(variation.pluviometria + ' mm');

		$('#filter .filter-result').show();
	}

	function getVariation(extent) {

		var startIndex;

		var start = _.find(filter.data, function(d, i) {
			startIndex = i;
			return extent[0].getFullYear() == d.date.getFullYear() &&
				extent[0].getMonth() == d.date.getMonth() &&
				extent[0].getDate() == d.date.getDate();
		});

		var dataFrom = _.rest(filter.data, startIndex);

		var between = [];

		var end = _.find(dataFrom, function(d) {
			between.push(d);
			return extent[1].getFullYear() == d.date.getFullYear() &&
				extent[1].getMonth() == d.date.getMonth() &&
				extent[1].getDate() == d.date.getDate();
		});

		var pluviometria = 0;

		_.each(between, function(d) {
			pluviometria = pluviometria + d.pluviometria
		});

		return {
			volume: (-start.volume + end.volume).toFixed(1),
			pluviometria: pluviometria.toFixed(1)
		};

	}

	return filter;

}


// var inputExtent = [];

// $('#filter input').on('keyup', _.debounce(function() {

// 	var date = moment($(this).val(), 'DD/MM/YYYY');

// 	var i = $(this).is('.start') ? 0 : 1;

// 	if($(this).val().length !== 10 || !date.isValid()) {
// 		$(this).addClass('invalid');
// 		delete inputExtent[i];
// 		brush.clear();
// 	} else {
// 		inputExtent[i] = date.toDate();
// 		if(inputExtent[0] && inputExtent[1]) {
// 			brush.extent(inputExtent);
// 		}
// 		brush.event(context.selectAll(".brush"));
// 	}


// }, 50));
