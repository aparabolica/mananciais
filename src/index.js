var d3 = require('d3'),
	_ = require('underscore'),
	$ = require('jquery'),
	parseData = require('./parse'),
	icons = require('./icons'),
	load = require('./load'),
	updateInfo = require('./updateInfo');

$(document).ready(function() {

	var selection;

	var margin = {top: 0, right: 20, bottom: 200, left: 20},
		width = $('body').width() - margin.left - margin.right,
		height = $('body').height() - margin.top - margin.bottom;

	var filterMargin = {top: height + 100, right: 40, bottom: 40, left: 40},
		filterWidth = width - 40,
		filterHeight = margin.bottom - 140;

	var volume = {};
	volume.x = d3.time.scale()
		.range([0, width]);
	volume.y = d3.scale.linear()
		.range([height, 180]);
	volume.area = d3.svg.area()
		.interpolate("monotone")
		.x(function(d) { return volume.x(d.date); })
		.y0(height)
		.y1(function(d) { return volume.y(d.volume); });
	volume.xAxis = d3.svg.axis()
		.scale(volume.x)
		.orient("bottom");

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

	function brushed() {
		volume.x.domain(brush.empty() ? filter.x.domain() : brush.extent());
		focus.select(".volume").attr("d", volume.area);
		focus.select(".x.axis").call(volume.xAxis);
	}

	var svg = d3.select("body").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom);

	svg.append("defs").append("clipPath")
		.attr("id", "clip")
		.append("rect")
			.attr("width", width)
			.attr("height", height);

	var focus = svg.append("g")
		.attr("class", "focus")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var context = svg.append("g")
		.attr("class", "context")
		.attr("transform", "translate(" + filterMargin.left + "," + filterMargin.top + ")");

	load('data.json', svg, function(err, data) {

		var parsed = parseData(data, 'sistemaCantareira');

		volume.x.domain(d3.extent(parsed, function(d) { return d.date; }));
		volume.y.domain([0, d3.max(parsed, function(d) { return d.volume; })]);

		var focusPath = focus.append("path")
			.datum(parsed)
			.attr("class", "area volume")
			.attr("d", volume.area);

		focus.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(volume.xAxis);

		var selectionRect = focus.append("svg:rect")
			.attr("class", "pane")
			.attr("fill", "transparent")
			.attr("width", width)
			.attr("height", height);

		var selectionLine = focus.append("line")
			.attr("x1", 0)
			.attr("y1", 0)
			.attr("x2", 0)
			.attr("y2", height)
			.style({stroke: '#fff', "stroke-width": '2px', 'stroke-opacity': .5})
			.attr("opacity", 0);

		filter.x.domain(volume.x.domain());
		filter.y.domain(volume.y.domain());

		var contextPath = context.append("path")
			.datum(parsed)
			.attr("class", "area volume")
			.attr("d", filter.area);

		context.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + filterHeight + ")")
			.call(filter.xAxis);

		context.append("g")
			.attr("class", "x brush")
			.call(brush)
			.selectAll("rect")
			.attr("y", -6)
			.attr("height", filterHeight + 7);

		$('#site-header .arrow').append($(icons.arrow));

		$('#site-header .mananciais').on('click', 'li', function() {
			$(this).parent().find('li').show();
			$(this).hide();
			var manancial = $(this).data('manancial');
			var text = $(this).text();
			$('h1 .manancial').text(text);
			parsed = parseData(data, manancial);
			focusPath.datum(parsed).transition().duration(2000).attr("d", volume.area);
			contextPath.datum(parsed).transition().duration(2000).attr("d", filter.area);
			focus.select(".x.axis").call(volume.xAxis);
			context.select(".x.axis").call(filter.xAxis);
			selection = _.last(parsed);
			updateInfo(selection);
		});

		$('#site-header .mananciais li:nth-child(1)').click();

		selectionRect.on("mousemove", function() {
			var X_pixel = d3.mouse(this)[0],
				X_date = volume.x.invert(X_pixel),
				Y_value;

			_.each(parsed, function(element, index, array) {
				if ((index+1 < array.length) && (array[index].date <= X_date) && (array[index+1].date >= X_date)) {
					if (X_date-array[index].date < array[index+1].date-X_date)
						selection = array[index];
					else
						selection = array[index+1];

					Y_value = selection.volume;
				}
			});

			selectionLine.attr("opacity", 1)
				.attr("x1", X_pixel)
				.attr("x2", X_pixel);

			updateInfo(selection);

		});

		selection = _.last(parsed);
		updateInfo(selection);

	});

});