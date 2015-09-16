"use strict";
define(function (require, exports, module) {
  /**
   * Module dependencies
   */
  var Handlebars = require("handlebars");
  var Chaplin = require("chaplin");

  /**
   * e.g. {{url "recipes#show" id}}
   *
   * @return {String} The resolved url
   */
  Handlebars.registerHelper("url", function () {
    var routeName = arguments[0];
    var params = [].slice.call(arguments, 1);

    return Chaplin.helpers.reverse(routeName, params);
  });
});
