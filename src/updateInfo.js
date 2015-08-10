'use strict';

var moment = require('moment'),
	$ = require('jquery'),
	icons = require('./icons'),
	_ = require('underscore');

require('moment/locale/pt-br');
moment.locale('pt-BR');

module.exports = function(data) {

	var $info = $('#info');

	$info.empty();

	var $head = $('<h2 />').html(icons.calendar + moment(data.date).format('LL'));
	var $data = $('<table />');

	$data.append(getInfo(data, 'volume'));
	$data.append(getInfo(data, 'pluviometria do dia'));

	$info.append($head);
	$info.append($data);

}

function getInfo(data, key) {

	var label = data[key];
	var indices = [];

	if(key == 'volume') {
		label = label.toFixed(1).replace('.', ',') + ' %';

		if(data.volume_indice_2) {
			indices[0] = data.volume_indice_2.toFixed(1).replace('.', ',') + ' %';
		}
		if(data.volume_indice_3) {
			indices[1] = data.volume_indice_3.toFixed(1).replace('.', ',') + ' %';
		}
	}

	var $tr = $('<tr />');
	var $label = $('<td />');
	var $value = $('<td>' + label + '</td>');
	var $subvalues = $('<p class="subvalues"></p>');

	$value.append($subvalues);

	if(indices.length) {
		_.each(indices, function(indice, i) {
			if(indice && typeof indice !== 'undefined') {
				$subvalues.append($('<span class="indice indice-' + (i+1) + '">' + indice + '</span>'));
			}
		});
	}

	// Volume
	if(key == 'volume') {
		$label.append($(icons.water));
		var cssClass = '';
		if(data.volume < 10) {
			cssClass = 'status-5';
		} else if(data.volume < 20) {
			cssClass = 'status-4';
		} else if(data.volume < 50) {
			cssClass = 'status-3';
		} else if(data.volume < 80) {
			cssClass = 'status-2';
		} else {
			cssClass = 'status-1';
		}
		$tr.addClass(cssClass);
		$tr.addClass('volume');
	// Pluviometria
	} else if(key == 'pluviometria do dia') {
		$label.append($(icons.rain));
		var cssClass = '';
		if(data.pluviometria < 0.5) {
			cssClass = 'status-5';
		} else if(data.pluviometria < 3) {
			cssClass = 'status-4';
		} else if(data.pluviometria < 20) {
			cssClass = 'status-3';
		} else if(data.pluviometria < 50) {
			cssClass = 'status-2';
		} else {
			cssClass = 'status-1';
		}
		$tr.addClass(cssClass);
		$tr.addClass('pluviometria');
	}

	$tr.append($label);
	$tr.append($value);

	return $tr;

}
