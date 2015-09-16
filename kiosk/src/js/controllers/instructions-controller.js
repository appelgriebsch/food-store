"use strict";
define(function (require, exports, module) {
  /**
   * Module dependencies
   */
  var Chaplin = require("chaplin");
  var InstructionsView = require("views/instructions-view");

  /**
   * InstructionsController definition
   */
  var InstructionsController = Chaplin.Controller.extend({});

  InstructionsController.prototype.initialize = function() {
    Chaplin.Controller.prototype.initialize.apply(this, arguments);

    this.view = new InstructionsView();
  };

  /**
   * Expose `InstructionsController`
   */
  module.exports = InstructionsController;
});
