"use strict";
define(function (require, exports, module) {
  /**
   * Module dependencies
   */
  var BaseCollection = require("models/base/collection");
  var DemandItem = require("models/demand-item");

  /**
   * Model definition
   */
  var DemandItems = BaseCollection.extend({
    model: DemandItem
  });

  /**
   * Expose `DemandItems`
   */
  module.exports = DemandItems;
});
