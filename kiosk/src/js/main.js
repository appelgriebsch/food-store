"use strict";
define(function (require, exports, module) {
  require("leapjs");
  require("qrcode");

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
