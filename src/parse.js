'use strict';

var _ = require('underscore'),
	moment = require('moment'),
	d3 = require('d3');

var volumeTotal = 1269.5;
var reserva1 = 182.5;
var reserva2 = 105;

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

			if(d.date <= new Date('2014-05-16')) {

				// d.volume_m3 = (volumeTotal) * (d.volume/100);
				//
				// d.volume = (d.volume_m3/volumeTotal)*100;

			} else if(d.date > new Date('2014-05-16') && d.date <= new Date('2014-10-24')) {

				d.volume_m3 = (volumeTotal-reserva1) * ((d.volume)/100);

				d.volume_indice_2 = (d.volume_m3/(volumeTotal))*100;

				d.volume = (((volumeTotal) * ((d.volume)/100)/volumeTotal)*100) - 18.5;

			} else if(d.date > new Date('2014-10-24')) {

				d.volume_m3 = (volumeTotal-reserva1-reserva2) * (d.volume/100);

				d.volume = ((d.volume_m3-reserva1-reserva2)/(volumeTotal-reserva1-reserva2))*100;

				d.volume_indice_2 = ((d.volume_m3-reserva2)/(volumeTotal-reserva2))*100;

				d.volume_indice_3 = (d.volume_m3/(volumeTotal))*100;
			}


		}

		if(parsed[i] && isNaN(d.volume)) {
			delete parsed[i];
		}
	});

	parsed = _.compact(parsed);

	return parsed;

}
