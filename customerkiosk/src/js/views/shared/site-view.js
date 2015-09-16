"use strict";
define(function (require, exports, module) {
  /**
   * Module dependencies
   */
  var Chaplin = require("chaplin");
  var BaseView = require("views/base/view");
  var template = require("requirejs-text!templates/shared/site.haml");

  /**
   * SiteView definition
   */
  var SiteView = BaseView.extend({
    template: template,
    container: "#app-container",
    regions: {
      "sidebar": "#sidebar",
      "sharing-overlay": "#sharing-overlay",
      "body": "#body"
    },
    events: {
      "mousemove": "_onMouseMove"
    }
  });
  SiteView.MAX_IDLE = 60000;

  /**
   * Starts a timer that checks whether the user has been inactive
   * for a specified time
   * @private
   */
  SiteView.prototype.initialize = function() {
    BaseView.prototype.initialize.apply(this, arguments);

    var self = this;

    this._lastAction = Date.now();
    this._checkInterval = setInterval(function () {
      if (Date.now() - self._lastAction >= SiteView.MAX_IDLE) {
        Chaplin.helpers.redirectTo("index#index");
      }
    }, 1000);
  };

  /**
   * Gets called whenever the mouse has been moved
   * @private
   */
  SiteView.prototype._onMouseMove = function() {
    this._lastAction = Date.now();
  };

  /**
   * Initializes overscroll
   * @private
   */
  SiteView.prototype.render = function() {
    BaseView.prototype.render.apply(this, arguments);

    var body = this.$el.find("#body");
    body.overscroll({ ignoreSizing: true });
    body.css({ position: "" });
  };

  /**
   * Stops the interval timer
   * @private
   */
  SiteView.prototype.dispose = function() {
    BaseView.prototype.dispose.apply(this, arguments);
    if (this._checkInterval) {
      clearInterval(this._checkInterval);
    }
  };

  /**
   * Expose SiteView
   */
  module.exports = SiteView;
});
