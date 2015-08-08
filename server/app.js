#!/usr/bin/env node

var program = require('commander'),
	colorsTmpl = require('colors-tmpl'),
	tablify = require('tablify'),
	fs = require('fs'),
	_ = require('underscore'),
	csv = require('csv'),
	scrape = require('./scrape'),
	request = require('request');

function print(s) {
	console.log(colorsTmpl(s));
}

program
	.version('0.0.1')
	.option('-u, --update', 'Scrape data from SABESP and update local database')
	.option('serve', 'Run server and update database on a 3 hours interval')
	.parse(process.argv);

if(program.update) {

	print('{yellow}{bold}Scrapping data{/bold}{/yellow}');
	scrape();

}

if(program.serve) {

	var port = process.env.PORT || 3000;

	var express = require('express');

	var app = express();

	//app.use(require('compression')());

	app.use('/', express.static(__dirname + '/../public'));

	//app.use(require('cors')());

	function getEvents(cb) {
		var csvUrl = 'https://docs.google.com/spreadsheets/d/17oq0WUIfUZTp7l0y1dtN9mqZuPInSZW2wclgUAvU8YQ/export?format=csv';
		request(csvUrl, function(err, res, body) {
			if(!err) {
				csv.parse(body, { columns: true }, function(err, output) {
					if(!err) {
						cb(output);
					} else {
						cb(false);
					}
				});
			} else {
				cb(false);
			}
		});
	}

	var events = [];
	getEvents(function(data) {
		if(data) events = data;
	});

	setInterval(function() {
		getEvents(function(data) {
			if(data) events = data;
		});
	}, 1000 * 60 * 2);

	app.get('/events', function(req, res) {
		res.send(events);
	});

	var getData = function(req, res) {
		res.header("Content-Type", 'text/plain');
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "X-Requested-With");
		res.sendfile('data/data.csv');
		// fs.readFile('data/data.csv', function(err, data) {
		// 	res.header("Content-Type", 'text/plain');
		// 	res.header("Content-Length", data.length);
		// 	res.header("Access-Control-Allow-Origin", "*");
		// 	res.header("Access-Control-Allow-Headers", "X-Requested-With");
		// 	res.send(data);
		// });
	};

	app.get('/data', getData);
	app.get('/data.csv', getData);

	app.get('/*', function(req, res) {
		res.sendfile('public/index.html');
	});

	app.listen(port, function() {
		print('{yellow}{bold}Server running at port ' + port + '{/bold}{/yellow}');
		print('{bold}Data url: http://localhost:' + port + '/data.csv{/bold}');
	});

	// setInterval(scrape, 1000 * 60 * 60 * 3); // 3 hours interval
	// scrape();

}
