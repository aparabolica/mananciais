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
		width = $('body').width() - margin.left - margin.right,
		height = $('body').height() - margin.top - margin.bottom;

	var volume = require('./volume')();

	var filter = require('./filter')(function(extent) {
		volume.brush(extent);
		pluviometria.brush(extent);
		stories.brush(extent);
	});

	var pluviometria = require('./pluviometria')();

	var stories = require('./stories')();

	/*****/

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

			return manancial;

		};

		var updateData = function(manancial) {

			parsed = data = parseData(d, manancial);

			volume.updateData(data);
			filter.updateData(data);
			stories.updateData(data);
			pluviometria.updateData(data);

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
			.style({stroke: '#fff', "stroke-width": '2px', 'stroke-opacity': .5})
			.attr("opacity", 0);

		stories.draw(parsed, focus, volume, width, height);
		pluviometria.draw(parsed, focus, volume, width, height);

		$('#site-header .arrow').append($(icons.arrow));

		$('#site-header .mananciais').on('click', 'li', function() {
			var manancial = changeManancial($(this));
			updateData(manancial);
		});

		changeManancial($('#site-header .mananciais li:nth-child(1)'));

		selectionRect.on("mousemove", function() {
			var X_pixel = d3.mouse(this)[0],
				X_date = volume.svg.x.invert(X_pixel),
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