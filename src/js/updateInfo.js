"use strict";

var moment = require("moment"),
  $ = require("jquery"),
  icons = require("./icons"),
  _ = require("underscore");

require("moment/locale/pt-br");
moment.locale("pt-BR");

module.exports = _.once(function() {
  var $info = $("#info");

  var $head = $("<h2 />");
  var $data = $("<table />");

  var $volume = $("<tr />");
  $volume.append('<td class="label" /><td class="value "/>');
  $volume.find(".label").html($(icons.water));

  var $pluviometria = $("<tr />");
  $pluviometria.append('<td class="label" /><td class="value "/>');
  $pluviometria.find(".label").html($(icons.rain));

  $data.append($volume);
  $data.append($pluviometria);

  $info.append($head);
  $info.append($data);

  var update = _.debounce(function(data) {
    if (data) {
      $head.html(icons.calendar + moment(data.date).format("LL"));
      getInfo(data, "volume", $volume);
      getInfo(data, "pluviometria do dia", $pluviometria);
    }
  }, 3);

  return {
    update: update
  };
});

function getInfo(data, key, $node) {
  var label = data[key];
  var indices = [];

  if (key == "volume") {
    label = label.toFixed(1).replace(".", ",") + " %";

    if (data.volume_indice_2) {
      indices[0] = data.volume_indice_2.toFixed(1).replace(".", ",") + " %";
    }
    if (data.volume_indice_3) {
      indices[1] = data.volume_indice_3.toFixed(1).replace(".", ",") + " %";
    }
  }

  $node.find(".value").text(label);

  if (indices.length) {
    var $subvalues = $('<p class="subvalues"/>');
    _.each(indices, function(indice, i) {
      if (indice && typeof indice !== "undefined") {
        $subvalues.append(
          $('<span class="indice indice-' + (i + 1) + '">' + indice + "</span>")
        );
      }
    });
    $node.find(".value").append($subvalues);
  }

  $node.removeClass(function(index, className) {
    return (className.match(/(^|\s)status-\S+/g) || []).join(" ");
  });

  // Volume
  if (key == "volume") {
    var cssClass = "";
    if (data.volume < 10) {
      cssClass = "status-5";
    } else if (data.volume < 20) {
      cssClass = "status-4";
    } else if (data.volume < 50) {
      cssClass = "status-3";
    } else if (data.volume < 80) {
      cssClass = "status-2";
    } else {
      cssClass = "status-1";
    }
    $node.addClass(cssClass);
    $node.addClass("volume");
    // Pluviometria
  } else if (key == "pluviometria do dia") {
    var cssClass = "";
    if (data.pluviometria < 0.5) {
      cssClass = "status-5";
    } else if (data.pluviometria < 3) {
      cssClass = "status-4";
    } else if (data.pluviometria < 20) {
      cssClass = "status-3";
    } else if (data.pluviometria < 50) {
      cssClass = "status-2";
    } else {
      cssClass = "status-1";
    }
    $node.addClass(cssClass);
    $node.addClass("pluviometria");
  }
}
