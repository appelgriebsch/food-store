"use strict";
define(function (require, exports, module) {
  /**
   * Module dependencies
   */
  var Chaplin = require("chaplin");

  /**
   * CalibrationController definition
   */
  var CalibrationController = Chaplin.Controller.extend({
    index: function () {
      var CalibrationIndexView = require("views/calibration/index-view");

      Chaplin.mediator.publish("instructions:stop");

      this.view = new CalibrationIndexView();
    }
  });

  /**
   * Expose `CalibrationController`
   */
  module.exports = CalibrationController;
});
