"use strict";
define(function (require, exports, module) {
  /**
   * Module dependencies
   */
  var Chaplin = require("chaplin");
  var Ingredient = require("models/ingredient");

  /**
   * Collection definition
   */
  var Ingredients = Chaplin.Collection.extend({
    model: Ingredient
  });

  /**
   * Sorting works like this:
   */
  Ingredients.prototype.comparator = function (a, b) {
    var unitSort = [
      "g", "ml", "EL", "TL"
    ];

    var x = unitSort.indexOf(a.get("unit"));
    var y = unitSort.indexOf(b.get("unit"));

    // Sort unknown units to the end
    if (x === -1) x = unitSort.length;
    if (y === -1) y = unitSort.length;

    // Sort empty units further to the end
    if (a.get("unit") === "") x++;
    if (b.get("unit") === "") y++;

    if (x === y) {
      return b.get("maxQuantity") - a.get("maxQuantity");
    }

    return x - y;
  };

  /**
   * Expose `Ingredients`
   */
  module.exports = Ingredients;
});
