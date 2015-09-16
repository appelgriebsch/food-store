"use strict";
define(function (require, exports, module) {
  /**
   * Module dependencies
   */
  var BaseView = require("views/base/view");
  var template = require("requirejs-text!templates/shared/pointer.hbs");

  /**
   * PointerView definition
   */
  var PointerView = BaseView.extend({
    template: template,
    autoRender: true,

    className: "pointer"
  });

  /**
   * Copy valid options
   * @param  {Object} options [description]
   * @private
   */
  PointerView.prototype.initialize = function(options) {
    BaseView.prototype.initialize.apply(this, arguments);

    var optionNames = ["left", "top"];
    if (options) {
      for (var key in options) {
        if (optionNames.indexOf(key) >= 0) {
          this["_" + key] = options[key];
        }
      }
    }
  };

  /**
   * Position the view
   * @private
   */
  PointerView.prototype.render = function() {
    BaseView.prototype.render.apply(this, arguments);

    this.$el.css({
      top: this._top,
      left: this._left
    });

    this._$canvas = this.$el.find("canvas");
    this._canvas = this._$canvas.get(0);
    this._context = this._canvas.getContext("2d");

    this._canvas.width = 80;
    this._canvas.height = 80;
  };

  /**
   * Draws the progress on the canvas
   * @param {Number} progress
   * @public
   */
  PointerView.prototype.setProgress = function(progress) {
    var context = this._context;
    var size = this._canvas.width;
    var start = 1.5 * Math.PI;

    context.fillStyle = "white";

    context.clearRect(0, 0, size, size);
    context.beginPath();
    context.arc(
      size / 2,
      size / 2,
      size / 2,
      start,
      start + 2 * progress * Math.PI
    );
    context.lineTo(size / 2, size / 2);
    context.fill();
    context.closePath();
  };

  /**
   * Clears the canvas / resets progress
   * @public
   */
  PointerView.prototype.resetProgress = function() {
    this.setProgress(0);
  };

  /**
   * Reposition the container
   * @param  {Object} position
   * @public
   */
  PointerView.prototype.move = function(position) {
    this.$el.css({
      left: position.left,
      top: position.top
    });
  };

  /**
   * Shows the pointer
   * @public
   */
  PointerView.prototype.show = function() {
    this.$el.addClass("visible");
  };

  /**
   * Hides the pointer
   * @public
   */
  PointerView.prototype.hide = function() {
    this.$el.removeClass("visible");
  };

  /**
   * Expose `PointerView`
   */
  module.exports = PointerView;
});
