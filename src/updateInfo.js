'use strict';

var moment = require('moment'),
	$ = require('jquery'),
	icons = require('./icons');

require('moment/lang/pt-br');
moment.lang('pt-BR');

module.exports = function(data) {

	var $info = $('#info');

	$info.empty();

	var $head = $('<h2 />').text(moment(data.date).format('LL'));
	var $data = $('<table />');

	data.data.forEach(function(item, i) {

		if(i == 0 || i == 1) {
		
			var $tr = $('<tr />');
			var $label = $('<td />');
			var $value = $('<td>' + item[1] + '</td>');

			if(i == 0)
				$label.append($(icons.water));
			else if(i == 1)
				$label.append($(icons.rain));

			$tr.append($label);
			$tr.append($value);

			$data.append($tr);
		}
	});

	$info.append($head);
	$info.append($data);

}