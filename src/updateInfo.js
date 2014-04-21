'use strict';

var moment = require('moment'),
	$ = require('jquery'),
	icons = require('./icons');

require('moment/lang/pt-br');
moment.lang('pt-BR');

module.exports = function(data) {

	var $info = $('#info');

	$info.empty();

	var $head = $('<h2 />').html(icons.calendar + moment(data.date).format('LL'));
	var $data = $('<table />');

	data.data.forEach(function(item, i) {

		if(i == 0 || i == 1) {
		
			var $tr = $('<tr />');
			var $label = $('<td />');
			var $value = $('<td>' + item[1] + '</td>');

			// Volume
			if(i == 0) {
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
			} else if(i == 1) {
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

			$data.append($tr);
		}
	});

	$info.append($head);
	$info.append($data);

}