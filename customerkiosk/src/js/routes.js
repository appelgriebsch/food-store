"use strict";
define(function (require, exports, module) {
  /**
   * Route definitions
   */
  var Routes = function (match) {
    match("", "index#index");
    match("shoppinglists/:user/:id", "shoppinglists#show");
  };

  /**
   * Expose `Routes`
   */
  module.exports = Routes;
});
