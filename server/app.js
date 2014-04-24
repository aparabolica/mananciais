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