'use strict';

var _ = require('underscore'),
	moment = require('moment'),
	d3 = require('d3');

var volumeUtil = 982;
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

				// d.volume_m3 = volumeUtil * (d.volume/100);
				// d.volume = (d.volume_m3/volumeUtil)*100;

			} else if(d.date > new Date('2014-05-16') && d.date <= new Date('2014-10-24')) {

				/*
				 * Corrigindo os índices da reserva 1 (1º volume morto)
				 */

				// Retorna em m3 o índice utilizado pela SABESP
				d.volume_m3 = volumeUtil * (d.volume/100);

				// Índice 2 mantém o valor armazenado acrescentando a reserva 1 ao volume útil
				d.volume_indice_2 = (d.volume_m3/(volumeUtil+reserva1))*100;

				// Índice 1 subtrai o valor armazenado da reserva 1 e matném o volume útil
				d.volume = ((d.volume_m3-reserva1)/volumeUtil)*100;

			} else if(d.date > new Date('2014-10-24')) {

				/*
				 * Corrigindo os índices da reserva 2 (2º volumo morto)
				 */

				// Retorna em m3 o índice o utilizado pela SABESP
				d.volume_m3 = volumeUtil * (d.volume/100);

				// Índice 2 subtrai o valor armazenado da reserva 2 e acrescenta a reserva 1 ao volume útil
				d.volume_indice_2 = ((d.volume_m3-reserva2)/(volumeUtil+reserva1))*100;

				// Índice 3 mantem a valor armazenado acrescentando as 2 reservas ao volume útil
				d.volume_indice_3 = (d.volume_m3/(volumeUtil+reserva1+reserva2))*100;

				// Índice 1 subrai o valor armazenado da reserva 1 e 2 e mantém o volume útil
				d.volume = ((d.volume_m3-reserva1-reserva2)/volumeUtil)*100;

			}


		}

		if(key == 'sistemaAltoTiete') {

			if(d.date > new Date('2014-12-14')) {

				d.volume_indice_2 = d.volume;
				d.volume = d.volume-6.6;

			}

		}

		if(parsed[i] && isNaN(d.volume)) {
			delete parsed[i];
		}
	});

	parsed = _.compact(parsed);

	return parsed;

}
