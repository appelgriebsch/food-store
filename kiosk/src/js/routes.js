"use strict";
define(function (require, exports, module) {
  /**
   * Route definitions
   */
  var Routes = function (match) {
    match("", "recipes#index");
    match("recipe/:id", "recipes#show");

    match("calibrate", "calibration#index");
  };

  /**
   * Expose `Routes`
   */
  module.exports = Routes;
});
