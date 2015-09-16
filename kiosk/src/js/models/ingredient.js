"use strict";
define(function (require, exports, module) {
  /**
   * Module dependencies
   */
  var Model = require("models/base/model");

  /**
   * Model definition
   */
  var Ingredient = Model.extend({
    defaults: {
      "minQuantity": 100,
      "maxQuantity": 100,
      "unit": "g",
      "unitPlural": "",
      "item": "Flour",
      "tags" : []
    }
  });

  /**
   * The units that don't need a space (" ") to the quantity
   * @type {Array}
   */
  Ingredient.nonSpaceUnits = ["g", "gr", "kg", "l", "dl", "ml", ""];

  /**
   * Add decorators on initialization
   * @private
   */
  Ingredient.prototype.initialize = function() {
    Model.prototype.initialize.apply(this, arguments);

    // Add some "fake" attributes
    this._addDecorators({
      formattedQuantity: this._getFormattedQuantity,
      quantities: this._getQuantities,
      amount: this._getAmount,
      name: this._getName
    });
  };

  /**
   * Returns an array with the calculated quantities
   * @return {Array} Calculated minQuantity,
   *                 calculated maxQuantity
   */
  Ingredient.prototype._getQuantities = function() {
    var minQuantity = this.minQuantity;
    var maxQuantity = this.maxQuantity;
    var recipe = this.recipe;

    minQuantity = minQuantity /
      recipe.get("servedPersons") *
      recipe.get("currentServedPersons");

    maxQuantity = maxQuantity /
      recipe.get("servedPersons") *
      recipe.get("currentServedPersons");

    return [minQuantity, maxQuantity];
  };

  /**
   * Returns the final calculated quantity
   * @return {String}
   */
  Ingredient.prototype._getFormattedQuantity = function() {
    var quantities = this.quantities;
    var quantity;
    var minQuantity = quantities[0];
    var maxQuantity = quantities[1];

    // Build quantity
    if (minQuantity !== maxQuantity) {
      return Math.ceil(minQuantity) + "-" + Math.ceil(maxQuantity);
    } else if(maxQuantity > 0) {
      quantity = maxQuantity;

      if (quantity < 2) {
        quantity = 0.5 * Math.ceil(quantity / 0.5);

        // Display 0.5 as ½
        if (Math.round(quantity) != quantity) {
          var fullQuantity = (quantity - 0.5);

          if (fullQuantity === 0) fullQuantity = "";

          quantity = fullQuantity + "½";
        }

        return quantity;
      } else if (quantity < 25) {
        return Math.ceil(quantity);
      } else if (quantity < 100) {
        return 5 * Math.ceil(quantity / 5);
      } else if (quantity < 250) {
        return 10 * Math.ceil(quantity / 10);
      } else if (quantity < 1000) {
        return 50 * Math.ceil(quantity / 50);
      } else {
        return 100 * Math.ceil(quantity / 100);
      }
    } else {
      return "";
    }
  };

  /**
   * Returns the formatted amount of this ingredient
   * @return {String}
   * @private
   */
  Ingredient.prototype._getAmount = function() {
    var quantities = this.quantities;
    var maxQuantity = quantities[1];

    // Build unit
    var unit = maxQuantity == 1 ? this.unit : (this.unitPlural || this.unit);
    if (Ingredient.nonSpaceUnits.indexOf(this.unit) === -1 && unit.length) {
      unit = " " + unit;
    }

    return this.formattedQuantity + unit;
  };

  /**
   * Returns the name / item of this ingredient
   * @return {String}
   * @private
   */
  Ingredient.prototype._getName = function() {
    var quantities = this.quantities;
    var maxQuantity = quantities[1];

    if ((maxQuantity > 0 && maxQuantity <= 1) || !this.itemPlural) {
      return this.item;
    } else {
      return this.itemPlural;
    }
  };

  /**
   * Expose `Ingredient`
   */
  module.exports = Ingredient;
});
