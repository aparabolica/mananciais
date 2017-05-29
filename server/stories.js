var request = require('request');
var csv = require('csv');
var RSS = require('rss');
var crypto = require('crypto');
var moment = require('moment');
var _ = require('underscore');

module.exports = function(app) {

  var Stories = {};

  var csvUrl = 'https://docs.google.com/spreadsheets/d/17oq0WUIfUZTp7l0y1dtN9mqZuPInSZW2wclgUAvU8YQ/export?format=csv';

  Stories.getStories = function(cb) {
    request(csvUrl, function(err, res, body) {
      if(!err) {
        csv.parse(body, { columns: true }, function(err, output) {
          if(!err) {
            cb(output);
          } else {
            cb(false);
          }
        });
      } else {
        cb(false);
      }
    });
  };

  var updateFeed = function(data) {
    Stories.feed = new RSS({
      title: 'Mananciais de São Paulo',
      description: 'Histórias coletadas sobre os mananciais de SP',
      feed_url: 'https://mananciais.tk/feed',
      site_url: 'https://mananciais.tk'
    });
    var items = _.map(data, function(item) {
      item.date = moment(item.data, 'DD/MM/YYYY').utc();
      return item;
    });
    items = _.sortBy(items, function(item) { return -item.date; });
    items.forEach(function(item) {
      Stories.feed.item({
        title: item.titulo,
        description: item.descricao,
        date: item.date,
        url: item.url,
        categories: [item.tipo],
        guid: crypto.createHmac('sha1', 'mananciais').update(item.url).digest('hex')
      })
    });
    Stories.xml = Stories.feed.xml({indent:true});
  }

	Stories.stories = [];
	Stories.getStories(function(data) {
		if(data) {
      updateFeed(data);
      Stories.stories = data;
    }
	});

	setInterval(function() {
		Stories.getStories(function(data) {
			if(data) {
        updateFeed(data);
        Stories.stories = data;
      }
		});
	}, 1000 * 60 * 2);

	app.get('/stories', function(req, res) {
		res.send(Stories.stories);
	});

  app.get('/feed', function(req, res) {
    res.header('Content-Type', 'text/xml');
    res.send(Stories.xml);
  });

  return Stories;

}
