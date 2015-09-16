"use strict";
define(function (require, exports, module) {
  /**
   * Module dependencies
   */
  var Chaplin = require("chaplin");
  var BaseView = require("views/base/view");
  var template = require("requirejs-text!templates/index/index.haml");
  var mediator = Chaplin.mediator;

  /**
   * IndexIndexView definition
   */
  var IndexIndexView = BaseView.extend({
    template: template,
    tagName: "div",
    listen: {
      "scanner:data mediator": "_onScannerData"
    }
  });

  /**
   * Starts listening to the scanner data after rendering
   * @private
   */
  IndexIndexView.prototype.render = function() {
    BaseView.prototype.render.apply(this, arguments);

    this.message = this.$el.find("#index-message");

    mediator.publish("scanner:start");
  };

  /**
   * Gets called every time the scanner has sent us some scanned data
   * @param  {Object} data
   * @private
   */
  IndexIndexView.prototype._onScannerData = function(data) {
    var self = this;

    if (data.evt === "data") {
      if (data.data && data.data.u && data.data.s) {
        Chaplin.helpers.redirectTo("shoppinglists#show", { user: data.data.u, id: data.data.s });
        mediator.publish("scanner:stop");
      } else {
        console.log("Invalid data:", data.data);
        mediator.publish("scanner:restart");
      }
    } else {
      mediator.publish("scanner:restart");
    }
  };

  /**
   * Expose IndexIndexView
   */
  module.exports = IndexIndexView;
});
