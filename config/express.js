
/**
 * Module dependencies.
 */

var express = require('express');
var compression = require('compression');
var swig = require('swig');
var path = require('path');

var helpers = require('view-helpers');
var pkg = require('../package.json');

var env = process.env.NODE_ENV || 'development';

/**
 * Expose
 */

module.exports = function (app) {

  var appRoot = path.normalize(__dirname + '/..');

  // Compression middleware (should be placed before express.static)
  app.use(compression({
    threshold: 512
  }));

  // Static files middleware
  app.use(express.static(appRoot + '/public'));

  // set views path, template engine and default layout
  app.engine('html', swig.renderFile);
  app.set('views', appRoot + '/app/views');
  app.set('view engine', 'html');

  // expose package.json to views
  app.use(function (req, res, next) {
    res.locals.pkg = pkg;
    res.locals.env = env;
    next();
  });

  // should be declared after session and flash
  app.use(helpers(pkg.name));

  // static files
  app.use(express.static(__dirname + '/../public'));

  app.use(require('cors')());




};
