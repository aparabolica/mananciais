'use strict';

var d3 = require('d3'),
	$ = require('jquery');

module.exports = function(svg, callback) {

	var progress = {
		twoPi: 2 * Math.PI,
		progress: 0,
		formatPercent: d3.format(".0%"),
		arc: d3.svg.arc().startAngle(0).innerRadius(180).outerRadius(240)
	};

	progress.meter = svg.append('g').attr('class', 'progress-meter').attr("transform", "translate(" + $('body').width() / 2 + "," + $('body').height() / 2 + ")");
	progress.meter.append('path').attr('class', 'background').attr('d', progress.arc.endAngle(progress.twoPi));

	progress.foreground = progress.meter.append('path').attr('class', 'foreground');

	progress.text = progress.meter.append('text').attr('text-anchor', 'middle').attr('dy', '.35em');

	ga('send', 'screenview', {'screenName': 'Loading'});

	d3.csv('/data')
		.on('progress', function() {
			var i = d3.interpolate(progress.progress, d3.event.loaded / d3.event.total);
			d3.transition().tween('progress', function() {
				return function(t) {
					progress.progress = i(t);
					progress.foreground.attr('d', progress.arc.endAngle(progress.twoPi * progress.progress));
					progress.text.text(progress.formatPercent(progress.progress));
				};
			});
		})
		.get(function(err, data) {
			ga('send', 'screenview', {'screenName': 'Graph'});
			ga('send', 'event', 'graph', 'loaded');
			progress.meter.transition().delay(250).attr("transform", "scale(0)");
			if(typeof callback == 'function')
				callback(err, data);
		});

};
