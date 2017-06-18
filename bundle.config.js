var transformHelper = require('gulp-bundle-assets').transformHelper;
var browserify = require('browserify');
var sourceStream = require('vinyl-source-stream');
var cdn = process.env.MANANCIAIS_CDN_HOST || '';

var mainStream = function (file, done) {
  browserify({
    entries: [file.path]
  })
    .bundle()
    .on('error', function (err) {
      if (file.bundleOptions.isWatch) {
        gutil.log(gutil.colors.red(err.toString()));
        this.emit('end');
      } else {
        throw err;
      }
    })
    .pipe(sourceStream('app.js')) // convert to gulp stream
    .pipe(done); // make sure to pipe to the "done" stream
};

module.exports = {
  bundle: {
    main: {
      scripts: './src/js/index.js',
      styles: [
        './src/css/app.css',
        './src/css/responsive.css'
      ],
      options: {
        transforms: {
          scripts: transformHelper.browserify(mainStream)
        },
        result: {
          type: {
            scripts: function xJavascript(path) {
              return "<script defer src='" + cdn + path + "' type='application/javascript'></script>";
            },
            styles: function html(path) {
              return "<link href='" + cdn + path + "' rel='stylesheet' type='text/css'/>";
            }
          }
        }
      }
    },
    vendor: {
      scripts: [
        './node_modules/d3/build/d3.js',
        './node_modules/underscore/underscore.js',
        './node_modules/jquery/dist/jquery.js',
        './node_modules/moment/min/moment-with-locales.js'
      ],
      options: {
        result: {
          type: {
            scripts: function html(path) {
              return "<script defer src='" + cdn + path + "' type='application/javascript'></script>";
            },
            styles: function html(path) {
              return "<link href='" + cdn + path + "' type='text/html'/>";
            }
          }
        }
      }
    }
  },
  copy: [
    {
      src: './src/img/**/*',
      base: './src'
    }
  ]
};
