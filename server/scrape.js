var $ = require('cheerio'),
_ = require('underscore'),
csv = require('csv'),
async = require('async'),
request = require('request'),
moment = require('moment'),
twix = require('twix'),
fs = require('fs'),
tablify = require('tablify'),
progress = require('progress');

var sabesp = 'http://www2.sabesp.com.br/mananciais/DivulgacaoSiteSabesp.aspx',
startTime = moment('2003-01-01'),
endTime = moment(),
itr = startTime.twix(endTime).iterate('days'),
range = [];

module.exports = function() {

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

	fs.readFile('data/data.csv', function(err, csvData) {
		csv.parse(csvData, { columns: true }, function(err, output) {
			var data = [];
			if(err) {
				console.log('Iniciando nova base de dados');
			} else {
				data = output;
			}
			scrap(data);
		});
	});

	console.log('Base de dados encontrada.');

};

function scrap(data) {

	var toDownload = [];
	var newData = [];

	if(data.length) {

		console.log();
		var bar = new progress('Checando dados [:bar] :percent', {
			complete: '=',
			incomplete: ' ',
			width: 40,
			total: range.length
		});

		range.forEach(function(option, i) {

			var date = option.cmbAno + '-' + option.cmbMes + '-' + option.cmbDia;

			var dateData = _.filter(data, function(d) { return d['data'] == date; });

			var valid = true;

			if(dateData.length == 6) {
				dateData.forEach(function(item) {
					for(var key in item) {
						if(!item[key])
						valid = false;
					}
				});
			} else {
				valid = false;
			}

			if(!valid) {
				toDownload.push(option);
			} else {
				newData = newData.concat(dateData);
			}

			bar.tick();

		});

		if(toDownload.length == 0) {
			console.log('\nBase de dados já está atualizada');
			return;
		}

	} else {

		toDownload = range;

	}

	console.log('\n' + toDownload.length + ' entradas faltando ou com erro.');

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

		console.log();
		var bar = new progress('Baixando :title [:bar] :percent', {
			complete: '=',
			incomplete: ' ',
			width: 40,
			total: toDownload.length
		});

		async.eachSeries(toDownload, function(option, cb) {

			var date = option.cmbAno + '-' + option.cmbMes + '-' + option.cmbDia;

			bar.tick(1, { title: date });

			var dateData = [];

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

				if(!err) {

					validation = getValidation(body);

					var html = $.load(body);
					var dataTable = html('#tabDados');

					if(dataTable.length) {

						var trPos = 1;

						// Mananciais
						for(var m = 0; m <= 5; m++) {

							var item = {
								data: date
							};

							// Dados
							for(var d = 1; d <= 6; d++) {

								var dataItem = dataTable.find('tr:nth-child(' + trPos + ')');

								if(dataItem.length) {

									if(d == 1) {

										var title = dataItem.find('td img').attr('src');
										if(title) {
											title = title.replace('imagens/', '').replace('.gif', '');
										}

										item['manancial'] = title;

									} else if(d !== 6) {

										if(title) {

											var key = dataItem.find('td:nth-child(1)').text();
											var value = dataItem.find('td:nth-child(2)').text();

											/*
											* Houve uma diferença na métrica de 20% utilizada a partir de 1 de setembro de 2004 no Sistema Cantareira
											*/
											if(title == 'sistemaCantareira' && key == 'volume armazenado' && moment(date, 'YYYY-MM-DD').isBefore(moment('2004-09-01', 'YYYY-MM-DD'))) {
												var parsed = parseFloat(value.replace(' %', '').replace(',', '.'));
												parsed = (parsed + 16.4).toFixed(1);
												value = parsed + ' %';
												value = value.replace('.',',');
											}

											// Arruma atualização da tabela exibindo diferentes índices a partir de 16/03/2015
											var indicesRegex = /.*1:\s+(.*)\s+%Índice 2.*/;
											if(value.match(indicesRegex)) {
												value = value.replace(indicesRegex, '$1') + ' %';
											}

											item[key] = value;
										}

									}

								} else {

									cb();

								}

								trPos++;

							}

							dateData.push(item);

						}

						newData = newData.concat(dateData);

					}

					cb();
				}

			})

		}, function(err) {
			if(err) {
				console.log(err);
			} else {
				data = _.sortBy(newData, function(d) { return new Date(d['data']).getTime(); });
				fs.writeFile('data/data.csv', toCSV(data), function(err) {
					if(err) console.log(err);
					else console.log('CSV updated');
					data = newData = [];
				});
			}
		});

	});
}

function getValidation(body) {
	var html = $.load(body);

	return {
		'__VIEWSTATE': html('#__VIEWSTATE').val(),
		'__EVENTVALIDATION': html('#__EVENTVALIDATION').val(),
		'Imagebutton1.x': 8,
		'Imagebutton1.y': 6
	};
}

function toCSV(data) {

	var csv = '"' + _.keys(data[0]).join('","') + '"\n';

	data.forEach(function(d, i) {

		csv += '"' + _.values(d).join('","') + '"\n';

	});

	return csv;

}
