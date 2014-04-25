var d3 = require('d3'),
	_ = require('underscore'),
	$ = require('jquery'),
	moment = require('moment'),
	parseData = require('./parse'),
	icons = require('./icons'),
	details = require('./details'),
	load = require('./load'),
	updateInfo = require('./updateInfo');

require('moment/lang/pt-br');
moment.lang('pt-BR');

$(document).ready(function() {

	$('.about-link').click(function() {
		ga('send', 'screenview', {'screenName': 'About'});
		$('section#about').show();
		return false;
	});

	$(document).keyup(function(e) {
		if (e.keyCode == 27) { $('section#about').hide() }
	});

	$('.close-about').click(function() {
		$('section#about').hide();
		return false;
	});

	var selection;

	var margin = {top: 0, right: 20, bottom: 260, left: 20},
		width = $('body').width() - margin.left - margin.right,
		height = $('body').height() - margin.top - margin.bottom;

	var filterMargin = {top: height + 60, right: 40, bottom: 40, left: 40},
		filterWidth = width - 40,
		filterHeight = margin.bottom - 160;

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

	var volume = {};
	volume.x = d3.time.scale()
		.range([0, width]);
	volume.y = d3.scale.linear()
		.range([height, 220]);
	volume.area = d3.svg.area()
		.interpolate("monotone")
		.x(function(d) { return volume.x(d.date); })
		.y0(height)
		.y1(function(d) { return volume.y(d.volume); });
	volume.xAxis = d3.svg.axis()
		.scale(volume.x)
		.tickFormat(timeFormat)
		.orient("bottom");
	volume.yFormat = function(d) {
		return d === 100 ? d + '% de volume armazenado' : d + '%';
	};
	volume.yAxis = d3.svg.axis()
		.scale(volume.y)
		.tickSize(width)
		.tickFormat(volume.yFormat)
		.orient("right");
	volume.customAxis = function(g) {
		g.selectAll("text")
			.attr("x", 4)
			.attr("dy", -4);
	};

	var pluviometria = {};

	pluviometria.xValue = function(d) { return d.date; };
	pluviometria.xScale = d3.time.scale().range([0, width]);
	pluviometria.xMap = function(d) { return pluviometria.xScale(pluviometria.xValue(d)); };

	pluviometria.yValue = function(d) { return d.volume; };
	pluviometria.yScale = d3.scale.linear().range([height, 220]);
	pluviometria.yMap = function(d) { return pluviometria.yScale(pluviometria.yValue(d)); };

	pluviometria.cValue = function(d) { return d.pluviometria; };
	pluviometria.cScale = d3.scale.linear().range(['rgba(42,110,194,1)', 'rgba(42,110,194,1)']);
	pluviometria.cMap = function(d) { return pluviometria.cScale(pluviometria.cValue(d)); };

	pluviometria.sValue = function(d) { return d.pluviometria; };
	pluviometria.sScale = d3.scale.linear().range([0, 10]);
	pluviometria.sMap = function(d) { return pluviometria.sScale(pluviometria.sValue(d)); };

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

		pluviometria.xScale.domain(brush.empty() ? filter.x.domain() : brush.extent());
		
		ga('send', 'event', 'graph', 'filtered');

		svg
			.selectAll(".dot")
			.attr("cx", pluviometria.xMap)
			.attr("cy", pluviometria.yMap);
	}

	var svg = d3.select("body").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.attr("id", "main-chart");

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

		focus
			.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(volume.xAxis);

		focus
			.append("g")
			.attr("class", "y axis")
			.call(volume.yAxis)
			.call(volume.customAxis);

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
			.attr("class", "selection-line")
			.style({stroke: '#fff', "stroke-width": '2px', 'stroke-opacity': .5})
			.attr("opacity", 0);

		pluviometria.xScale.domain(volume.x.domain());
		pluviometria.yScale.domain(volume.y.domain());
		pluviometria.sScale.domain(d3.extent(parsed, function(d) { return d.pluviometria; }));
		pluviometria.cScale.domain(d3.extent(parsed, function(d) { return d.pluviometria; }));

		var pluviometriaDots = focus.append("g")
			.attr("transform", "translate(0,0)")
			.attr("class", "pluviometria");

		var tooltip = d3.select("body").append("div")
			.attr("class", "tooltip")
			.style("opacity", 0);

		pluviometriaDots
			.selectAll(".dot")
			.data(parsed)
				.enter().append("circle")
				.attr("class", "dot")
				.attr("r", pluviometria.sMap)
				.attr("cx", pluviometria.xMap)
				.attr("cy", 220)
				.on("mouseover", function(d) {
					tooltip.transition()
						.duration(200)
						.style("opacity", 1);
				
						tooltip.html(icons.rain + d.pluviometria + "mm")
						.style("left", (d3.event.pageX) + "px")
						.style("top", (d3.event.pageY) + "px");
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
			$('.manancial-info').empty();
			var manancial = $(this).data('manancial');
			var text = $(this).text();
			ga('send', 'event', 'graph', 'changed', null, manancial);
			$('h1 .manancial').text(text);
			parsed = parseData(data, manancial);
			if(details[manancial]) {
				var info = '<p>' + details[manancial].join('</p><p>') + '</p>';
				$('.manancial-info').append('<div class="info"><div class="toggler">' + icons.info + '</div><div class="info-container"><div class="info-content">' + info + '</div></div>');
			}
			focusPath.datum(parsed).transition().duration(2000).attr("d", volume.area);
			contextPath.datum(parsed).transition().duration(2000).attr("d", filter.area);
			focus.select(".x.axis").call(volume.xAxis);
			context.select(".x.axis").call(filter.xAxis);

			pluviometriaDots
				.selectAll(".dot")
				.data(parsed)
				.transition()
				.duration(2000)
				.attr("class", "dot")
				.attr("r", pluviometria.sMap)
				.attr("cx", pluviometria.xMap)
				.attr("cy", pluviometria.yMap);

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