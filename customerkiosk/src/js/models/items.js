"use strict";
define(function (require, exports, module) {
  /**
   * Module dependencies
   */
  var BaseCollection = require("models/base/collection");
  var Item = require("models/item");

  /**
   * Items definition
   */
  var Items = BaseCollection.extend({
    model: Item
  });

  /**
   * Expose `Items`
   */
  module.exports = Items;
});
