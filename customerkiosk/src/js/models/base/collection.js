"use strict";
define(function (require, exports, module) {
  /**
   * Module dependencies
   */
  var Chaplin = require("chaplin");
  var Config = require("config");

  /**
   * Collection definition
   */
  var Collection = Chaplin.Collection.extend({
    path: Config.RESTURL
  });

  /**
   * Assembles the correct backend url for this collection
   * @private
   */
  Collection.prototype.initialize = function () {
    Chaplin.Collection.prototype.initialize.apply(this, arguments);

    if (typeof this.path !== "undefined") {
      this.url = this.path + this.url;
    }
  };

  /**
   * Expose `Collection`
   */
  module.exports = Collection;
});
