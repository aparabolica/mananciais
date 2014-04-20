var $ = require('cheerio'),
	_ = require('underscore'),
	async = require('async'),
	request = require('request'),
	moment = require('moment'),
	twix = require('twix'),
	fs = require('fs');

var sabesp = 'http://www2.sabesp.com.br/mananciais/DivulgacaoSiteSabesp.aspx';

var startTime = moment('2003-01-01');
var endTime = moment();
var itr = startTime.twix(endTime).iterate('days');

var range = [];

while(itr.hasNext()) {
	var current = itr.next();
	range.push({
		cmbAno: current.year(),
		cmbMes: current.month() + 1,
		cmbDia: current.date()
	});
}

// Push present day
range.push({
	cmbAno: endTime.year(),
	cmbMes: endTime.month() + 1,
	cmbDia: endTime.date()
});

/*
 * Initialize db
 */

var data;

try {
	data = require('./data.json');
	console.log('Base de dados encontrada. Atualizando...');
} catch(err) {
	data = {};
	console.log('Iniciando nova base de dados');
}

// First connection to get form data;

request({
	url: sabesp,
	jar: true,
	method: 'GET',
	headers: {
		'User-Agent': 'Mozilla/5.0 (X11; Linux i686) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/30.0.1599.114 Safari/537.36',
		'Host': 'www2.sabesp.com.br'
	}
}, function(err, res, body) {

	var validation = getValidation(body);

	async.eachSeries(range, function(option, cb) {

		var optionKey = option.cmbAno + '-' + option.cmbMes + '-' + option.cmbDia;

		if(data[optionKey] && !_.isEmpty(data[optionKey])) {
			console.log('Dia ' + optionKey + ' já registrado na base de dados');
			return cb();
		}

		request({
			url: sabesp,
			method: 'POST',
			headers: {
				'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
				'Host': 'www2.sabesp.com.br',
				'Origin': 'http://www2.sabesp.com.br',
				'Referer': sabesp,
				'User-Agent': 'Mozilla/5.0 (X11; Linux i686) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/30.0.1599.114 Safari/537.36'
			},
			jar: true,
			form: _.extend(option, validation)
		}, function(err, res, body) {

			if(err) {

				console.log(err);
				cb('Error');

			} else {

				console.log('Processando dados do dia: ' + optionKey);

				validation = getValidation(body);

				var html = $.load(body);
				var dataTable = html('#tabDados');

				var mananciais = {};

				var trPos = 1;

				// Mananciais
				for(var m = 0; m <= 5; m++) {

					// Dados
					for(var d = 1; d <= 6; d++) {

						var dataItem = dataTable.find('tr:nth-child(' + trPos + ')');

						if(dataItem.length) {

							if(d == 1) {
							
								var title = dataItem.find('td img').attr('src');
								if(title) {
									title = title.replace('imagens/', '').replace('.gif', '');
									mananciais[title] = [];
								}

							} else if(d !== 6) {

								if(title) {
									var key = dataItem.find('td:nth-child(1)').text();
									var value = dataItem.find('td:nth-child(2)').text();

									mananciais[title].push([key, value]);
								}

							}

						}

						trPos++;

					}

				}

				data[optionKey] = mananciais;

				cb();
			}

		})

	}, function(err) {
		if(err) {
			console.log(err);
		} else {
			fs.writeFile('data.json', JSON.stringify(data), function(err) {
				if(err) console.log(err);
				else console.log('Done');
			});
		}
	});

});

function getValidation(body) {
	var html = $.load(body);

	return {
		'__VIEWSTATE': html('#__VIEWSTATE').val(),
		'__EVENTVALIDATION': html('#__EVENTVALIDATION').val(),
		'Imagebutton1.x': 8,
		'Imagebutton1.y': 6
	};
}