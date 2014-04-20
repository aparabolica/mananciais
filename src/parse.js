'use strict';

var _ = require('underscore'),
	d3 = require('d3');

module.exports = function(data, key) {

	var parsed = [];

	for(var date in data) {

		parsed.push({
			'date': date,
			'data': data[date][key]
		})

	}

	var formatTime = d3.time.format("%Y-%-m-%-d");

	_.each(parsed, function(d, i) {
		try {
			d.volume = parseFloat(d.data[0][1].replace(' %', '').replace(',', '.'));
			d.pluviometria = parseFloat(d.data[1][1].replace(' mm', '').replace(',', '.'));
			d.date = formatTime.parse(d.date);
		} catch(err) {
			delete parsed[i];
			console.log('Error on date ' + d.date);
		}

		if(parsed[i] && isNaN(d.volume)) {
			console.log('Missing data on ' + d.date);
			delete parsed[i];
		}
	});

	parsed = _.compact(parsed);

	return parsed;

}