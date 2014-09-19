
/*!
 * Module dependencies.
 */

var fs = require('fs');


/**
 * Expose routes
 */

module.exports = function (app, passport) {

	app.get('/data.csv', function(req, res) {
		fs.readFile('data/data.csv', function(err, data) {
			res.header("Content-Length", data.length);
			res.header("Access-Control-Allow-Origin", "*");
			res.header("Access-Control-Allow-Headers", "X-Requested-With");
			res.sendFile('data.csv', {root: './data'});
		});
	});

	// panel
	app.get('/painel', function(req, res) {
		res.render('panel');
	});

	// home
	app.get('/', function(req, res) {
		res.render('home');
	});


}
