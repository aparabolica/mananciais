var d3 = require('d3'),
	moment = require('moment'),
	_ = require('underscore'),
	$ = require('jquery');

$(document).ready(function() {

	var margin = {top: 100, right: 100, bottom: 100, left: 100},
		width = $(window).width() - margin.left - margin.right,
		height = $(window).height() - margin.top - margin.bottom;

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

		var cantareira = [];

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

		svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis);

		svg.append("g")
			.attr("class", "y axis")
			.call(yAxis)
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", ".71em")
			.style("text-anchor", "end")
		 	.text("Volume");

		svg.append("path")
			.datum(cantareira)
			.attr("class", "area")
			.attr("d", area);

	}, 'json');
});