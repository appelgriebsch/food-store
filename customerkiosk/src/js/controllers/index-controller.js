"use strict";
define(function (require, exports, module) {
  /**
   * Module dependencies
   */
  var Chaplin = require("chaplin");

  /**
   * IndexController definition
   */
  var IndexController = Chaplin.Controller.extend({});

  /**
   * GET /
   */
  IndexController.prototype.index = function() {
    var IndexIndexView = require("views/index/index-view");

    this.view = new IndexIndexView({
      container: "#app-container",
      autoRender: true
    });
  };

  /**
   * Expose IndexController
   */
  module.exports = IndexController;
});
