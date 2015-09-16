"use strict";
define(function (require, exports, module) {
  /**
   * Module dependencies
   */
  var BaseCollection = require("models/base/collection");
  var Demand = require("models/demand");

  /**
   * Demands definition
   */
  var Demands = BaseCollection.extend({
    model: Demand
  });

  /**
   * Expose `Demands`
   */
  module.exports = Demands;
});
