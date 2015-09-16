"use strict";
define(function (require, exports, module) {
  /**
   * Module dependencies
   */
  var Chaplin = require("chaplin");
  var Routes = require("routes");
  var Scanner = require("lib/scanner");
  var mediator = Chaplin.mediator;

  mediator.scanner = new Scanner("ws://localhost:4510");

  require("jquery-overscroll");

  /**
   * Pre-require all controllers so that they are built into
   * the final init.js file
   */
  require("controllers/index-controller");
  require("controllers/shoppinglists-controller");

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
   * Override `initialize` with this.config
   * @private
   */
  Application.prototype.initialize = function() {
    Chaplin.Application.prototype.initialize.call(this, this.config);
  };

  /**
   * Expose `Application`
   */
  window.app = Application;
  module.exports = Application;
});
