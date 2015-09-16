"use strict";
define(function (require, exports, module) {
  /**
   * Module dependencies
   */
  var BaseCollection = require("models/base/collection");
  var Friendlist = require("models/friendlist");

  /**
   * Friendlists definition
   */
  var Friendlists = BaseCollection.extend({
    model: Friendlist
  });

  /**
   * Expose `Friendlists`
   */
  module.exports = Friendlists;
});
