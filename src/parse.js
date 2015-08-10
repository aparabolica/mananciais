'use strict';

var _ = require('underscore'),
	moment = require('moment'),
	d3 = require('d3');

module.exports = function(data, key) {

	var parsed = _.filter(data, function(d) { return d.manancial == key; });

	var formatTime = d3.time.format("%Y-%-m-%-d");

	_.each(parsed, function(d, i) {
		try {
			d.volume = parseFloat(d['volume armazenado'].replace(' %', '').replace(',', '.'));
			d.pluviometria = parseFloat(d['pluviometria do dia'].replace(' mm', '').replace(',', '.'));
			d.date = formatTime.parse(d['data']);
		} catch(err) {
			delete parsed[i];
		}

		/*
		 * VOLUME MORTO
		 */
		if(key == 'sistemaCantareira') {

			if(d.date > new Date('2014-05-16')) {
				d.originalVolume = d.volume;
				d.volume_indice_2 = d.volume;
				d.volume = d.volume - 18.5;
			}

			if(d.date > new Date('2014-10-24')) {
				// d.originalVolume = d.volume;
				d.volume_indice_2 = d.volume_indice_2 - 10.7;
				d.volume_indice_3 = d.originalVolume;
				d.volume = d.volume - 10.7;
			}

		}

		if(parsed[i] && isNaN(d.volume)) {
			delete parsed[i];
		}
	});

	parsed = _.compact(parsed);

	return parsed;

}
