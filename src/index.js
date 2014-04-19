var d3 = require('d3'),
	moment = require('moment'),
	_ = require('underscore'),
	$ = require('jquery');

require('moment/lang/pt-br');
moment.lang('pt-BR');

var water = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" width="100px" height="100px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve"><g><path fill="#fff" d="M69.231,64.095c-2.421,0-4.647-0.932-6.309-2.599c-1.678,1.648-3.953,2.599-6.343,2.599   c-2.426,0-4.718-0.987-6.399-2.677c-1.716,1.653-4.177,2.677-6.669,2.677c-2.388,0-4.664-0.95-6.339-2.599   c-1.661,1.667-3.888,2.599-6.307,2.599c-2.255,0-4.399-0.847-6.041-2.323c-3.125,16.186,9.333,30.56,25.177,30.56   c15.817,0,28.26-14.327,25.19-30.48C73.561,63.282,71.446,64.095,69.231,64.095z"/><path fill="#fff" d="M56.58,61.556c2.111,0,4.097-1.161,5.313-2.888C62.133,58.33,62.52,58,62.933,58c0.001,0,0.003,0,0.004,0   c0.414,0,0.802,0.334,1.038,0.674c1.216,1.748,3.133,2.816,5.257,2.816c2.066,0,4.003-0.96,5.225-2.619   c-0.456-1.491-1.032-2.972-1.767-4.472C63.127,34.916,60.078,29.174,50.001,7.654C40.756,28.36,36.872,34.93,27.312,54.414   c-0.722,1.469-1.288,2.939-1.74,4.403c1.218,1.713,3.19,2.737,5.294,2.737c2.122,0,4.038-1.003,5.255-2.751   c0.237-0.341,0.599-0.571,1.043-0.545c0.412,0,0.799,0.201,1.037,0.539c1.219,1.726,3.204,2.758,5.311,2.758   c2.216,0,4.482-1.124,5.64-2.797c0.017-0.024,0.038-0.044,0.057-0.066c0.029-0.035,0.056-0.073,0.09-0.104   c0.037-0.038,0.076-0.069,0.117-0.102c0.019-0.015,0.036-0.033,0.057-0.049c0.005-0.003,0.012-0.005,0.017-0.008   c0.044-0.031,0.093-0.055,0.141-0.08c0.029-0.014,0.055-0.031,0.083-0.042c0.042-0.018,0.086-0.028,0.129-0.04   c0.036-0.011,0.072-0.025,0.108-0.032c0.042-0.008,0.083-0.009,0.125-0.013c0.04-0.004,0.078-0.01,0.116-0.01   c0.044,0,0.089,0.006,0.134,0.013c0.036,0.002,0.073,0.003,0.108,0.01c0.042,0.008,0.084,0.022,0.125,0.036   c0.037,0.011,0.075,0.02,0.112,0.034c0.035,0.013,0.068,0.034,0.103,0.053c0.041,0.02,0.083,0.041,0.122,0.066   c0.007,0.005,0.015,0.008,0.022,0.013c0.026,0.018,0.047,0.042,0.072,0.061c0.034,0.028,0.067,0.054,0.099,0.085   c0.036,0.035,0.066,0.076,0.098,0.113c0.017,0.022,0.036,0.04,0.051,0.062C52.453,60.51,54.449,61.556,56.58,61.556z"/></g></svg>';

var rain = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" width="100px" height="100px" viewBox="0 0 100 100" enable-background="new 0 0 100 100" xml:space="preserve"><g id="Captions"></g><g id="Your_Icon"><path fill="#fff" d="M87.914,27.748c-2.284-1.504-4.933-2.418-7.657-2.646c-0.464-0.039-0.931-0.058-1.385-0.058   c-0.165,0-0.32,0.003-0.461,0.007c-0.007,0-0.013,0-0.019,0C76.893,14,69.124,4.74,58.45,1.353   c-1.045-0.331-2.124-0.607-3.203-0.817C53.419,0.18,51.546,0,49.679,0c-8.39,0-16.362,3.636-21.874,9.976l-1.394,1.602   c-5.52,0.425-10.652,2.779-14.608,6.735C7.416,22.699,5,28.531,5,34.736c0,6.205,2.416,12.037,6.803,16.424   c4.389,4.387,10.22,6.803,16.424,6.803h50.646c9.076,0,16.461-7.384,16.461-16.46C95.333,35.949,92.559,30.807,87.914,27.748z    M78.872,54.59H28.227c-10.966,0-19.854-8.887-19.854-19.854c0-10.966,8.889-19.855,19.854-19.855c0.024,0,0.049,0.001,0.073,0.001   c0,0,5.403,0.056,9.264,3.323c0,0-2.107-4.31-7.213-6.016c4.693-5.4,11.61-8.817,19.328-8.817c1.684,0,3.329,0.164,4.923,0.475   c0.963,0.187,1.906,0.429,2.828,0.721c9.461,3.003,16.542,11.352,17.693,21.5c-0.093,0.05-0.185,0.103-0.28,0.157   c-0.619,0.354-1.189,0.764-1.717,1.208c-0.834,0.703-1.556,1.494-2.173,2.287c-0.586,0.757-1.075,1.517-1.471,2.207   c-0.9,1.561-1.322,2.765-1.322,2.765c0.504-1.008,1.146-1.856,1.835-2.564c0.786-0.806,1.635-1.432,2.419-1.908   c1.568-0.953,2.873-1.306,2.873-1.306c1.028-0.292,2.105-0.46,3.219-0.491c0.121-0.003,0.243-0.006,0.366-0.006   c0.372,0,0.739,0.017,1.104,0.047c2.234,0.186,4.31,0.934,6.085,2.103c3.554,2.34,5.9,6.365,5.9,10.938   C91.961,48.731,86.101,54.59,78.872,54.59z"/><path fill="#fff" d="M20.391,62.742c-0.93,0-1.686,0.755-1.686,1.687v7.799c0,0.931,0.756,1.686,1.686,1.686c0.933,0,1.686-0.755,1.686-1.686   v-7.799C22.076,63.497,21.323,62.742,20.391,62.742z"/><path fill="#fff" d="M50.167,62.742c-0.932,0-1.687,0.755-1.687,1.687v7.799c0,0.931,0.755,1.686,1.687,1.686s1.685-0.755,1.685-1.686v-7.799   C51.852,63.497,51.099,62.742,50.167,62.742z"/><path fill="#fff" d="M50.167,88.603c-0.932,0-1.687,0.756-1.687,1.687v7.799c0,0.932,0.755,1.687,1.687,1.687s1.685-0.755,1.685-1.687v-7.799   C51.852,89.358,51.099,88.603,50.167,88.603z"/><path fill="#fff" d="M35.228,70.542c-0.931,0-1.687,0.756-1.687,1.686v7.799c0,0.932,0.756,1.687,1.687,1.687c0.93,0,1.687-0.755,1.687-1.687   v-7.799C36.914,71.298,36.157,70.542,35.228,70.542z"/><path fill="#fff" d="M26.123,80.804c-0.932,0-1.685,0.755-1.685,1.687v7.799c0,0.931,0.753,1.686,1.685,1.686s1.686-0.755,1.686-1.686V82.49   C27.809,81.559,27.055,80.804,26.123,80.804z"/><path fill="#fff" d="M63.888,70.542c-0.932,0-1.687,0.756-1.687,1.686v7.799c0,0.932,0.755,1.687,1.687,1.687c0.931,0,1.686-0.755,1.686-1.687   v-7.799C65.573,71.298,64.818,70.542,63.888,70.542z"/><path fill="#fff" d="M71.979,84.703c-0.932,0-1.686,0.755-1.686,1.687v7.8c0,0.931,0.754,1.686,1.686,1.686c0.931,0,1.687-0.755,1.687-1.686   v-7.8C73.666,85.458,72.91,84.703,71.979,84.703z"/><path fill="#fff" d="M78.213,62.742c-0.931,0-1.687,0.755-1.687,1.687v7.799c0,0.931,0.756,1.686,1.687,1.686c0.932,0,1.686-0.755,1.686-1.686   v-7.799C79.898,63.497,79.145,62.742,78.213,62.742z"/></g></svg>';

$(document).ready(function() {

	var cantareira = [];
	var selection;

	var $info = $('#info');

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

	// var pluviometria = {};
	// pluviometria.x = d3.time.scale()
	// 	.range([0, width]);
	// pluviometria.y = d3.scale.linear()
	// 	.range([height, 180]);
	// pluviometria.line = d3.svg.line()
	// 	.interpolate("monotone")
	// 	.x(function(d) { return pluviometria.x(d.date); })
	// 	.y(function(d) { return pluviometria.y(d.pluviometria); });

	var filter = {};
	filter.x1 = d3.time.scale()
		.range([0, filterWidth]);
	filter.y1 = d3.scale.linear()
		.range([filterHeight, 0]);
	filter.x2 = d3.time.scale()
		.range([0, filterWidth]);
	filter.y2 = d3.scale.linear()
		.range([filterHeight, 0]);
	filter.area = d3.svg.area()
		.interpolate("monotone")
		.x(function(d) { return filter.x1(d.date); })
		.y0(filterHeight)
		.y1(function(d) { return filter.y1(d.volume); });
	// filter.line = d3.svg.line()
	// 	.interpolate("monotone")
	// 	.x(function(d) { return filter.x2(d.date); })
	// 	.y(function(d) { return filter.y2(d.pluviometria); });
	filter.xAxis = d3.svg.axis()
		.scale(filter.x1)
		.orient("bottom");

	var brush = d3.svg.brush().x(filter.x1).on("brush", brushed);

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

	// Progress

	progress = {
		twoPi: 2 * Math.PI,
		progress: 0,
		total:  4278249,
		formatPercent: d3.format("0.%"),
		arc: d3.svg.arc().startAngle(0).innerRadius(180).outerRadius(240)
	}

	progress.meter = svg.append('g').attr('class', 'progress-meter').attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
	progress.meter.append('path').attr('class', 'background').attr('d', progress.arc.endAngle(progress.twoPi));

	progress.foreground = progress.meter.append('path').attr('class', 'foreground');

	progress.text = progress.meter.append('text').attr('text-anchor', 'middle').attr('dy', '.35em');

	d3.json('data.json')
		.on('progress', function() {
			var i = d3.interpolate(progress.progress, d3.event.loaded / progress.total);
			d3.transition().tween('progress', function() {
				return function(t) {
					progress.progress = i(t);
					progress.foreground.attr('d', progress.arc.endAngle(progress.twoPi * progress.progress));
					progress.text.text(progress.formatPercent(progress.progress));
				};
			});
		})
		.get(function(err, data) {

			progress.meter.transition().delay(250).attr("transform", "scale(0)");

			for(var date in data) {

				cantareira.push({
					'date': date,
					'data': data[date].sistemaCantareira
				})

			}

			cantareira.forEach(function(d, i) {
				try {
					d.volume = parseFloat(d.data[0][1].replace(' %', '').replace(',', '.'));
					d.pluviometria = parseFloat(d.data[1][1].replace(' mm', '').replace(',', '.'));
					d.date = moment(d.date).toDate();
				} catch(err) {
					delete cantareira[i];
					console.log('Error on date ' + d.date);
				}
			});

			cantareira = _.compact(cantareira);

			volume.x.domain(d3.extent(cantareira, function(d) { return d.date; }));
			volume.y.domain([0, d3.max(cantareira, function(d) { return d.volume; })]);

			// pluviometria.x.domain(d3.extent(cantareira, function(d) { return d.date; }));
			// pluviometria.y.domain(d3.extent(cantareira, function(d) { return d.pluviometria; }));

			filter.x1.domain(volume.x.domain());
			filter.y1.domain(volume.y.domain());

			// filter.x2.domain(pluviometria.x.domain());
			// filter.y2.domain(pluviometria.y.domain());

			focus.append("path")
				.datum(cantareira)
				.attr("class", "area volume")
				.attr("d", volume.area);

			focus.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0," + height + ")")
				.call(volume.xAxis);

			// focus.append("path")
			// 	.datum(cantareira)
			// 	.attr("class", "line pluviometria")
			// 	.attr("d", pluviometria.line);

			var selectionLine = focus.append("line")
				.attr("x1", 0)
				.attr("y1", 0)
				.attr("x2", 0)
				.attr("y2", height)
				.style({stroke: '#fff', "stroke-width": '2px', 'stroke-opacity': .5})
				.attr("opacity", 0);

			context.append("path")
				.datum(cantareira)
				.attr("class", "area volume")
				.attr("d", filter.area);

			// context.append("path")
			// 	.datum(cantareira)
			// 	.attr("class", "line pluviometria")
			// 	.attr("d", filter.line);

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

			var rect = focus.append("svg:rect")
				.attr("class", "pane")
				.attr("fill", "transparent")
				.attr("width", width)
				.attr("height", height);

			rect.on("mousemove", function() {
				var X_pixel = d3.mouse(this)[0],
					X_date = volume.x.invert(X_pixel),
					Y_value;

				cantareira.forEach(function(element, index, array) {
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

			function updateInfo(data) {

				$info.empty();

				var $head = $('<h2 />').text(moment(data.date).format('LL'));


				$data = $('<table />');

				data.data.forEach(function(item, i) {

					if(i == 0 || i == 1) {
					
						var $tr = $('<tr />');
						var $label = $('<td />');
						var $value = $('<td>' + item[1] + '</td>');

						if(i == 0)
							$label.append($(water));
						else if(i == 1)
							$label.append($(rain));

						$tr.append($label);
						$tr.append($value);

						$data.append($tr);
					}
				});

				$info.append($head);
				$info.append($data);

			}

		});

	function brushed() {
		volume.x.domain(brush.empty() ? filter.x1.domain() : brush.extent());
		// pluviometria.x.domain(brush.empty() ? filter.x2.domain() : brush.extent());
		focus.select(".volume").attr("d", volume.area);
		// focus.select(".pluviometria").attr("d", pluviometria.area);
		focus.select(".x.axis").call(volume.xAxis);
	}
});