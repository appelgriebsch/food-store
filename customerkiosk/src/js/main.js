"use strict";
define(function (require) {
  /**
   * Module dependencies
   */
  var Application = require("application");

  /**
   * Main application entry point
   */
  $(function() {
      window.app = new Application();
  });
});
