"use strict";
define(function (require, exports, module) {
  /**
   * Module dependencies
   */
  var BaseModel = require("models/base/model");

  /**
   * Model definition
   */
  var Friendlist = BaseModel.extend({
    defaults: {
      selected: false
    }
  });

  /**
   * Expose `Friendlist`
   */
  module.exports = Friendlist;
});
