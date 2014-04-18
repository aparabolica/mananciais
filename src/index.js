var d3 = require('d3'),
	moment = require('moment'),
	_ = require('underscore'),
	$ = require('jquery');

require('moment/lang/pt-br');
moment.lang('pt-BR');

$(document).ready(function() {

	var cantareira = [];
	var selection;

	var $chart = $('#chart');
	var $info = $('#info');

	var margin = {top: 180, right: 20, bottom: 20, left: 20},
		width = $('body').width() - margin.left - margin.right,
		height = $('body').height() - margin.top - margin.bottom;

	var x = d3.time.scale()
		.range([0, width]);

	var y = d3.scale.linear()
		.range([height, 0]);

	var xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom");

	var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left");

	var area = d3.svg.area()
		.x(function(d) { return x(d.date); })
		.y0(height)
		.y1(function(d) { return y(d.volume); });

	var svg = d3.select("body").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	$.get('data.json', function(data) {

		for(var date in data) {

			cantareira.push({
				'date': date,
				'data': data[date].sistemaCantareira
			})

		}

		var i = 0;
		cantareira.forEach(function(d) {
			try {
				d.volume = +parseFloat(d.data[0][1].replace(' %', '').replace(',', '.'));
				d.date = moment(d.date).toDate();
			} catch(err) {
				delete cantareira[i];
				console.log('Error on date ' + d.date);
			}
			i++;
		});

		cantareira = _.compact(cantareira);

		x.domain(d3.extent(cantareira, function(d) { return d.date; }));
		y.domain([0, d3.max(cantareira, function(d) { return d.volume; })]);

		// svg.append("g")
		// 	.attr("class", "x axis")
		// 	.attr("transform", "translate(0," + height + ")")
		// 	.call(xAxis);

		// svg.append("g")
		// 	.attr("class", "y axis")
		// 	.call(yAxis)
		// 	.append("text")
		// 	.attr("transform", "rotate(-90)")
		// 	.attr("y", 6)
		// 	.attr("dy", ".71em")
		// 	.style("text-anchor", "end")
		//  	.text("Volume");

		var areaPath = svg.append("path")
			.datum(cantareira)
			.attr("class", "area")
			.attr("d", area);

		var circle = svg.append("circle")
			.attr("r", 8)
			.attr("cx", 0)
			.attr("cy", 0)
			.style({fill: '#fff', 'fill-opacity': .2, stroke: '#000', "stroke-width": '1px'})
			.attr("opacity", 0);

		var rect = svg.append("svg:rect")
			.attr("class", "pane")
			.attr("fill", "transparent")
			.attr("width", width)
			.attr("height", height);

		rect.on("mousemove", function() {
			var X_pixel = d3.mouse(this)[0],
				X_date = x.invert(X_pixel),
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

			circle.attr("opacity", 1)
				.attr("cx", X_pixel)
				.attr("cy", Math.round(y(Y_value)));

			updateInfo(selection);

		});

		function updateInfo(data) {

			$info.empty();

			var $head = $('<h2 />').text(moment(data.date).format('LL'));


			$data = $('<table />');

			data.data.forEach(function(item) {
				var $tr = $('<tr />');
				$tr.append('<td><h3>' + item[0] + '</h3></td><td>' + item[1] + '</td>');
				$data.append($tr);
			});

			$info.append($head);
			$info.append($data);

		}

	}, 'json');
});