"use strict";
define(function (require, exports, module) {
  /**
   * Module dependencies
   */
  var Model = require("models/base/model");

  /**
   * Model definition
   */
  var Step = Model.extend({
    defaults: {
      "description": "Cook some noodles, yo!",
      "photo": ""
    }
  });

  /**
   * Expose `Step`
   */
  module.exports = Step;
});
