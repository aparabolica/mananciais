var $ = require('cheerio'),
path = require('path'),
_ = require('underscore'),
csvParse = require('csv-parse'),
async = require('async'),
request = require('request'),
moment = require('moment'),
twix = require('twix'),
fs = require('fs'),
tablify = require('tablify'),
progress = require('progress');

var sabesp = 'http://mananciais.sabesp.com.br/Home',
sabesp2 = 'http://mananciais.sabesp.com.br/api/Mananciais/ResumoSistemas/'
startTime = moment('2003-01-01', 'YYYY-MM-DD'),
endTime = moment(),
itr = startTime.twix(endTime).iterate('days'),
range = [];

var appDir = path.dirname(require.main.filename);

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

	fs.readFile(appDir + '/data/data.csv', {encoding: 'utf8'}, function(err, csvData) {
		csvParse(csvData, { columns: true }, function(err, output) {
			var data = [];
			if(err) {
				console.log('Iniciando nova base de dados');
			} else {
				data = output;
				console.log('Base de dados encontrada.');
			}
			scrape(data);
		});
	});

};

function scrape(data) {

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

			if(dateData.length >= 6) {
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
			'Upgrade-Insecure-Requests': '1',
			'Host': 'mananciais.sabesp.com.br'
		}
	}, function(err, res, body) {

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
				url: sabesp2 + date.replace(/-(\d)\b/g, "-0$1"),
				method: 'GET',
				headers: {
					'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
					'Host': 'mananciais.sabesp.com.br',
					'Origin': sabesp,
					'Upgrade-Insecure-Requests': '1',
					'Referer': sabesp,
					'User-Agent': 'Mozilla/5.0 (X11; Linux i686) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/30.0.1599.114 Safari/537.36'
				},
				jar: true,
			}, function(err, res, body) {

				if(!err) {

					var json = JSON.parse(body);

					for(var sist of json.ReturnObj.sistemas) {
						var item = {
							data: date,
							manancial: "sistema" + sist.Nome.replace("ê", "e").replace("ã", "a").replace("ç", "c").replace(" ", ""),
							'volume armazenado': sist.VolumePorcentagemAR + " %",
							'pluviometria do dia': sist.PrecDia + " mm",
							'pluviometria acumulada no mês': sist.PrecMensal + " mm",
							'média histórica do mês': sist.PrecHist + " mm"
						};
						dateData.push(item);
					}

					newData = newData.concat(dateData);

				}

				cb();

			})

		}, function(err) {
			if(err) {
				console.log(err);
			} else {
				data = _.sortBy(newData, function(d) { return new Date(d['data']).getTime(); });
				fs.writeFile(appDir + '/data/data.csv', toCSV(data), function(err) {
					if(err) console.log(err);
					else console.log('CSV updated');
					data = newData = [];
				});
			}
		});

	});
}

function toCSV(data) {

	var csv = '"' + _.keys(data[0]).join('","') + '"\n';

	data.forEach(function(d, i) {

		csv += '"' + _.values(d).join('","') + '"\n';

	});

	return csv;

}
