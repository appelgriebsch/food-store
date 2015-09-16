"use strict";
define(function (require, exports, module) {
  /**
   * Module dependencies
   */
  var Collection = require("models/base/collection");
  var Step = require("models/step");

  /**
   * Collection definition
   */
  var Steps = Collection.extend({
    model: Step
  });

  /**
   * Expose `Steps`
   */
  module.exports = Steps;
});
