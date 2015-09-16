"use strict";
define(function (require, exports, module) {
  /**
   * Module dependencies
   */
  var Underscore = require("underscore");
  var Chaplin = require("chaplin");
  var Leap = require("lib/leap");
  var Routes = require("routes");
  var InstructionsController = require("controllers/instructions-controller");

  /**
   * Application definition
   */
  var Application = Chaplin.Application.extend({
    config: {
      name: "foodstore",
      root: "/",
      controllerSuffix: "-controller",
      routes: Routes,
      pushState: false
    }
  });

  /**
   * Pre-require other controllers
   */
  require("controllers/calibration-controller");
  require("controllers/recipes-controller");

  /**
   * Override `initialize` with this.config
   * @private
   */
  Application.prototype.initialize = function() {
    this.leap = Leap.getLeap();

    Chaplin.mediator.leapController = this.leap._controller;
    Chaplin.mediator.calibrating = false;

    this._initControllers();
    Chaplin.Application.prototype.initialize.call(this, this.config);
  };

  /**
   * Initialize app-wide controllers that are
   * always present. In this case it's only the
   * InstructionsController
   * @private
   */
  Application.prototype._initControllers = function() {
    this.instructions = new InstructionsController();
  };

  /**
   * Expose `Application`
   */
  module.exports = Application;
});
