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
		width,
		height;

	var updateDimensions = function() {
		width = $(window).width() - margin.left - margin.right,
		height = $(window).height() - margin.top - margin.bottom;
	};

	updateDimensions();

	var volume = require('./volume')();

	var filter = require('./filter')(function(extent) {
		// Brush graph by filter
		// volume.brush(extent);
		// pluviometria.brush(extent);
		// if(stories)
		// 	stories.brush(extent);
	});

	var pluviometria = require('./pluviometria')();

	var stories = require('./stories')();
	// var stories = false;

	var svg = d3.select("body").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.attr("id", "main-chart");

	var zoom = d3.behavior.zoom();
	// var zoom = zoom;

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

	load(svg, function(err, d) {

		var parsed = parseData(d, 'sistemaCantareira');

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

			$('#legend .manancial').hide();
			$('#legend .' + manancial).show();

			return manancial;

		};

		var updateData = function(manancial) {

			parsed = data = parseData(d, manancial);

			volume.updateData(data);
			filter.updateData(data);
			pluviometria.updateData(data);
			if(stories)
				stories.updateData(data, manancial);

			selection = _.last(data);
			updateInfo(selection);

		};

		volume.draw(parsed, focus, width, height);

		filter.draw(parsed, svg, width, height, margin);

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
			.style({stroke: '#fff', "stroke-width": '2px', 'stroke-opacity': .5, 'pointer-events': 'none'})
			.attr("opacity", 0);


		pluviometria.draw(parsed, focus, volume, width, height);

		if(stories)
			stories.draw(parsed, focus, volume, width, height);

		$('#site-header .arrow').append($(icons.arrow));

		$('#site-header .mananciais').on('click', 'li', function() {
			var manancial = changeManancial($(this));
			updateData(manancial);
		});

		changeManancial($('#site-header .mananciais li:nth-child(1)'));

		selectionRect.on("mousemove", function() {
			var X_pixel = d3.mouse(this)[0],
				X_date = volume.svg.x.invert(X_pixel),
				selection = false;

			selectionLine.attr("opacity", 1)
				.attr("x1", X_pixel)
				.attr("x2", X_pixel);

			_.each(parsed, function(element, index, array) {

				if(selection)
					return false;

				if ((index+1 < array.length) && (array[index].date <= X_date) && (array[index+1].date >= X_date)) {
					if (X_date-array[index].date < array[index+1].date-X_date)
						selection = array[index];
					else
						selection = array[index+1];
				}

			});


			updateInfo(selection);

		});

		selection = _.last(parsed);
		updateInfo(selection);

		$(window).resize(function() {

			updateDimensions();

			svg.attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom);

			//volume.resize(width, height);

			//filter.resize(width, height, margin);
			//pluviometria.resize(width, height, margin);
			//filter.resize(width, height, margin);

		}).resize();

		if(zoom) {
			zoom.x(volume.svg.x).scaleExtent([1,17]).on("zoom", function() {
				volume.redraw();
				pluviometria.hide();
				if(stories)
					stories.preBrush(volume.svg.x.domain());
				drawTools();
			});
		}

		var drawTools = _.debounce(function() {
			setTimeout(function() {
				filter.brushArea(volume.svg.x.domain());
				if(stories)
					stories.brush(volume.svg.x.domain());
				pluviometria.brush(volume.svg.x.domain());
			}, 100);
		}, 300);

	});

});
