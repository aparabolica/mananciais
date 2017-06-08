'use strict';

var d3 = require('d3'),
	_ = require('underscore'),
	$ = require('jquery'),
	moment = require('moment'),
	parseData = require('./parse'),
	icons = require('./icons'),
	details = require('./details'),
	load = require('./load'),
	updateInfo = require('./updateInfo'),
	data;

window.$ = window.jQuery = $;

require('moment/locale/pt-br');
moment.locale('pt-BR');

// Embed
window.isEmbed = false;
if(window != window.top) {
	window.isEmbed = true;
}

$(document).ready(function() {

	if(isEmbed) {
		$('body').addClass('embed');
	}

	$('.about-link').click(function() {
		ga('send', 'screenview', {'screenName': 'About'});
		$('section#about').show();
		return false;
	});

	$('.embed-link').click(function() {
		ga('send', 'screenview', {'screenName': 'Embed'});
		$('section#embed-chart').show();
		return false;
	});

	$('.compare-link').click(function() {
		ga('send', 'screenview', {'screenName': 'Compare'});
		$('section#compare-data').show();
		if(compare) {
			compare.chart();
		}
		return false;
	});

	$(document).keyup(function(e) {
		if (e.keyCode == 27) { $('.modal').hide() }
	});

	$('.close-modal').click(function() {
		$('.modal').hide();
		return false;
	});

	var mouseTip = true;
	setTimeout(function() {
		$('body').on('mousemove', '#main-chart', function() {
			if(mouseTip) {
				setTimeout(function() {
					mouseTip = false;
					$('.mouse-tip').addClass('inactive');
					setTimeout(function() {
						$('.mouse-tip').hide();
					}, 400);
				}, 1500);
			}
		});
	}, 2000);

	var selection;

	var margin = {top: 0, right: 20, bottom: 270, left: 20},
		width,
		height;

	var updateDimensions = function() {
		if(isEmbed) {
			margin.bottom = $(window).height() * 0.25;
		}
		width = ($(window).width() * 0.7) - margin.left - margin.right,
		height = $(window).height() - margin.top - margin.bottom;
		if(isEmbed) {
			width = $(window).width() - margin.left - margin.right;
		}
	};

	updateDimensions();

	var info = updateInfo();

	var volume = require('./volume')();

	var filter = false;
	var compare = false;
	if(!isEmbed) {
		filter = require('./filter')();
		compare = require('./compare')(filter);
	}

	var pluviometria = require('./pluviometria')();
	// var pluviometria = false;

	var stories = require('./stories')(info);
	// var stories = false;

	var svg = d3.select("body").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.attr("id", "main-chart");

	var zoom = d3.zoom()
		.scaleExtent([1, Infinity])
		.translateExtent([[-100, 0], [width+100, height]])
		.extent([[-100, 0], [width+100, height]]);

	var focus = svg.append("g")
		.attr("class", "focus")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
		.call(zoom);

	svg.append("rect")
		.attr("class", "zoom-pane")
		.attr('fill', 'transparent')
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.call(zoom);

	$('#legend,#stories').hide();

	load(svg, function(err, d) {

		var parsed = parseData(d, 'sistemaCantareira');
		var parsedPerDate = {};

		_.each(parsed, function(element) {
			parsedPerDate[moment(element.date).format('YYYY-MM-DD')] = element;
		});

		// set global
		data = parsed;

		var changeManancial = function(el) {

			el.parent().find('li').show();
			el.hide();
			$('.manancial-info').empty();
			var manancial = el.data('manancial');
			var text = el.text();
			ga('send', 'event', 'graph', 'changed', null, manancial);
			$('h1 .manancial').text(text);
			if(details[manancial]) {
				var info = '<p>' + details[manancial].join('</p><p>') + '</p>';
				$('.manancial-info').append('<div class="info"><div class="toggler">' + icons.info + '</div><div class="info-container"><div class="info-content">' + info + '</div></div>');
			}

			$('#legend,#stories').show();

			$('#legend .manancial').hide();
			$('#legend .' + manancial).show();

			return manancial;

		};

		var updateData = function(manancial) {

			parsed = data = parseData(d, manancial);
			parsedPerDate = {};
			_.each(parsed, function(element) {
				parsedPerDate[moment(element.date).format('YYYY-MM-DD')] = element;
			});

			volume.updateData(data);
			if(filter)
				filter.updateData(data);
			if(pluviometria)
				pluviometria.updateData(data);
			if(stories)
				stories.updateData(data, manancial);

			if(compare)
				compare.draw();

			selection = _.last(data);
			if(info)
				info.update(selection);

		};

		volume.draw(parsed, focus, width, height);

		if(filter)
			filter.draw(parsed, svg, width, height, margin);

		if(compare)
			compare.draw();

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
			.attr("class", "selection-line");

		selectionLine.style('stroke', '#fff');
		selectionLine.style('stroke-width', '2px');
		selectionLine.style('stroke-opacity', '.5');
		selectionLine.style('pointer-events', 'none');

		if(pluviometria)
			pluviometria.draw(parsed, focus, volume, width, height);

		if(stories)
			stories.draw(parsed, focus, volume, width, height);

		$('#site-header .arrow').append($(icons.arrow));

		$('#site-header .mananciais').on('click', 'li', function() {
			var manancial = changeManancial($(this));
			updateData(manancial);
		});

		changeManancial($('#site-header .mananciais li:eq(0)'));

		selectionRect.on("mousemove", function() {
			var X_pixel = d3.mouse(this)[0],
				X_date = volume.svg.x.invert(X_pixel),
				selection = false;

			selectionLine
				.attr("opacity", 1)
				.attr("x1", X_pixel)
				.attr("x2", X_pixel);

			selection = parsedPerDate[moment(X_date).format('YYYY-MM-DD')];

			if(info)
				info.update(selection);

		});

		selection = _.last(parsed);
		if(info)
			info.update(selection);

		$(window).resize(function() {

			updateDimensions();

			svg
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom);

			selectionRect
				.attr("width", width)
				.attr("height", height);

			selectionLine
				.attr("y2", height);

			zoom
				.translateExtent([[-100, 0], [width+100, height]])
				.extent([[-100, 0], [width+100, height]])

			volume.resize(width, height);

			if(filter)
				filter.resize(width, height, margin);

			if(pluviometria)
				pluviometria.resize(width, height);

			if(stories)
				stories.resize(width, height);

			svg.select('.zoom-pane')
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
				.call(zoom);

			focus.call(zoom);

		}).resize();

		if(zoom) {
			zoom.on("zoom", function() {
				var transform = d3.event.transform;
				var scale = transform.rescaleX(volume.svg.x2);
				volume.svg.axis.x.scale(scale);
				volume.svg.x.domain(scale.domain());
				volume.zoom();
				if(pluviometria)
					pluviometria.hide();
				if(stories) {
					// stories.preBrush(volume.svg.x.domain());
					stories.hide();
				}
				drawTools();
			});
		}

		var drawTools = _.debounce(function() {
			if(pluviometria) {
				setTimeout(function() {
					pluviometria.zoom(volume.svg.x.domain());
				}, 5);
			}
			if(stories) {
				setTimeout(function() {
					stories.zoom(volume.svg.x.domain());
				}, 10);
			}
			if(filter.svg) {
				setTimeout(function() {
					filter.brushArea(volume.svg.x.domain());
				}, 15);
			}
		}, 300);

	});

});
