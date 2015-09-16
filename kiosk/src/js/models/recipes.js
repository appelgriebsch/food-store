"use strict";
define(function (require, exports, module) {
  /**
   * Module dependencies
   */
  var Collection = require("models/base/collection");
  var Config = require("config");
  var Recipe = require("models/recipe");

  /**
   * Collection definition
   */
  var Recipes = Collection.extend({
    model: Recipe,
    url: Config.RESTURL + "/recipes?callback=?",
    parse: function (response) {
      return response.data;
    }
  });

  /**
   * Expose `Recipes`
   */
  module.exports = Recipes;
});
