"use strict";
define(function (require, exports, module) {
  /**
   * Module dependencies
   */
  var BaseModel = require("models/base/model");

  /**
   * Model definition
   */
  var Item = BaseModel.extend({});

  /**
   * Tells us whether this item has a promotional price
   * @return {Boolean}
   * @private
   */
  Item.prototype.isPromotional = function() {
    return this.promo !== this.price;
  };

  /**
   * Gets the customer of this item / shoppinglist
   * @return {Customer}
   * @private
   */
  Item.prototype.getCustomer = function() {
    return this.get("demandJoins").at(0).get("demand").get("shoppinglist").get("customer");
  };

  /**
   * Returns the formatted promotional price
   * @return {String}
   */
  Item.prototype.getFormattedPromo = function() {
    return this.get("promo").toFixed(2) + "€";
  };

  /**
   * Expose `Item`
   */
  module.exports = Item;
});


