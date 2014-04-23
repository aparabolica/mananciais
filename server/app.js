#!/usr/bin/env node

var program = require('commander'),
	scrap = require('./scrap');

function formatDate(item) {

	var sep = '======================================\n';

	var output = '';

	for(var key in item) {
		output += sep + key + '\n' + sep;
		output += formatManancial(item[key]);
	}

	return output;
}

function formatManancial(item) {
	var output = '';
	item.forEach(function(d) {
		output += d[0] + '\t\t\t\t' + d[1] + '\n';
	});
	output += '\n\n';
	return output;
}

program
	.version('0.0.1')
	.option('-u, --update', 'Scrap data from SABESP and update local database')
	.option('-d, --date [value]', 'Get specific date from database.')
	.option('-m, --manancial [value]', 'Get info on specific date from an especific water system. Date parameter is required')
	.parse(process.argv);

if(program.date) {
	if(typeof(program.date) == 'string') {
		var data = require('../data.json');
		if(program.manancial && typeof(program.manancial) == 'string') {
			console.log('\nBuscando dados em: ' + program.date + ' de ' + program.manancial + '\n');
			console.log(formatManancial(data[program.date][program.manancial]));
		} else {
			console.log('\nBuscando dados em: ' + program.date + '\n');
			console.log(formatDate(data[program.date]));
		}
	}
}

if(program.update) {

	console.log('Scrapping data');
	scrap();

}