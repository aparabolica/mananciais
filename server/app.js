#!/usr/bin/env node

var program = require('commander'),
	colorsTmpl = require('colors-tmpl'),
	tablify = require('tablify'),
	_ = require('underscore'),
	csv = require('csv'),
	scrap = require('./scrap');

function print(s) {
	console.log(colorsTmpl(s));
}

program
	.version('0.0.1')
	.option('-u, --update', 'Scrap data from SABESP and update local database')
	.option('-d, --date [value]', 'Get specific date from database.')
	.option('-m, --manancial [value]', 'Get info on specific date from an especific water system. Date parameter is required')
	.option('serve', 'Run server and update database on a 3 hours interval')
	.parse(process.argv);

if(program.date) {
	if(typeof(program.date) == 'string') {
		csv().from.path('data/data.csv', {
			columns: true
		}).to.array(function(data) {
			if(program.manancial && typeof(program.manancial) == 'string') {
				print('\n{yellow}{bold}Buscando dados em: ' + program.date + ' de ' + program.manancial + '{/bold}{/yellow}\n');
				print(tablify(_.filter(data, function(d) { return d['data'] == program.date && d['manancial'] == program.manancial; })));
			} else {
				print('\n{yellow}{bold}Buscando dados em: ' + program.date + '{/bold}{/yellow}\n');
				print(tablify(_.filter(data, function(d) { return d['data'] == program.date; })));
			}
		});
	}
}

if(program.update) {

	print('{yellow}{bold}Scrapping data{/bold}{/yellow}');
	scrap();

}

if(program.serve) {

	var port = process.env.PORT || 3000;

	var express = require('express');

	var app = express();

	app.use('/', express.static(__dirname + '/../public'));

	app.use(require('cors')());

	app.get('/data.csv', function(req, res) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "X-Requested-With");
		res.sendfile('data.csv', {root: './data'});
	});

	app.get('/*', function(req, res) {
		res.sendfile('public/index.html');
	});

	setInterval(scrap, 1000 * 60 * 60 * 3); // 3 hours interval
	scrap();

	app.listen(port, function() {
		print('{yellow}{bold}Server running at port ' + port + '{/bold}{/yellow}');
		print('{bold}Data url: http://localhost:' + port + '/data.csv{/bold}');
	});

}