"use strict";
define(function (require, exports, module) {
  /**
   * Module dependencies
   */
  var Chaplin = require("chaplin");
  var BaseView = require("views/base/view");
  var PointerView = require("views/shared/pointer-view");
  var LeapViewMixin = require("views/base/leap-view-mixin");
  var template = require("requirejs-text!templates/calibration/index.hbs");

  /**
   * Settings
   */
  var CALIBRATION_DURATION = 1000;
  var RECALIBRATION_TIMER = 5000;

  /**
   * IndexView definition
   */
  var IndexView = BaseView.extend({
    autoRender: true,

    template: template,

    id: "calibration-index",

    container: "div#app-container",
    listen: {
      "leap:point:raw mediator": "_onPointRaw",
      "leap:object_clicked mediator": "_onObjectClicked"
    }
  }).extend(LeapViewMixin);

  /**
   * Define points etc.
   * @private
   */
  IndexView.prototype.initialize = function() {
    LeapViewMixin.initialize.apply(this, arguments);

    Chaplin.mediator.calibrating = true;

    this._points = [
      { left: "25%", top: "50%" },
      { left: "25%", top: "25%" },
      { left: "75%", top: "50%" }
    ];
  };

  /**
   * Reset all states etc.
   * @private
   */
  IndexView.prototype._reset = function() {
    if (this._recalibrationTimer) {
      clearInterval(this._recalibrationTimer);
      this._recalibrationTimer = null;
    }

    this._calibrationDoneContainer.removeClass("visible");

    this._pointPositions = [];
    this._pointIndex = 0;
    this._lastPosition = null;
    this._pointerView.hide();
    this._pointing = false;
    this._pointingBegan = Date.now();

    // Disable the default pointing behavior
    this._enablePointing = false;

    this._calibratePoint(this._pointIndex);
  };

  /**
   * Start calibration of the first point
   * @private
   */
  IndexView.prototype.render = function() {
    LeapViewMixin.render.apply(this, arguments);

    this._calibrationDoneContainer = this.$el.find("#calibration");
    this._recalibrationTimerContainer = this.$el.find("#calibration-reset-timer");

    this._reset();
  };

  /**
   * Register the screen settings to LeapJS,
   * switch to overview
   * @private
   */
  IndexView.prototype._finishCalibration = function() {
    var screen = new Leap.Screen(this._pointPositions);
    var controller = Chaplin.mediator.leapController;
    var self = this;

    this.removeSubview("calibrationPointer");
    this._calibrationPointer = null;
    this._calibrationDoneContainer.addClass("visible");

    controller.calibratedScreens().clear();
    controller._screens.push(screen);
    controller._screens.save();

    this._recalibrationTimerStarted = Date.now();
    this._recalibrationTimer = setInterval(function () {
      var timeLeft = RECALIBRATION_TIMER - (Date.now() - self._recalibrationTimerStarted);
      self._recalibrationTimerContainer.text(Math.ceil(timeLeft / 1000));

      if (timeLeft <= 0) {
        self._reset();
      }
    }, 100);

    this._enablePointing = true;
  };

  /**
   * Display the pointer div
   * @param  {Number} index
   * @private
   */
  IndexView.prototype._calibratePoint = function(index) {
    if (this._currentPointer) this._currentPointer.dispose();

    var point = this._points[index];

    this._calibrationPointer = new PointerView({
      left: point.left,
      top: point.top,
      container: this.$el
    });

    this.subview("calibrationPointer", this._calibrationPointer);
    this._calibrationPointer.show();
  };

  /**
   * Update the progress on the pointer
   * @private
   */
  IndexView.prototype._update = function() {
    LeapViewMixin._update.apply(this, arguments);

    var pointerView = this._calibrationPointer;
    var progress;

    if (pointerView && this._pointing) {
      progress = Math.min(1,
        (Date.now() - this._pointingBegan) / CALIBRATION_DURATION
      );
      pointerView.setProgress(progress);

      if (progress === 1) {
        this._pointing = false;
        this._pointIndex++;
        this._pointPositions.push(this._lastPosition);

        if (!this._points[this._pointIndex]) {
          // We just selected the last point, finish
          // the calibration
          this._finishCalibration();
        } else {
          this._calibratePoint(this._pointIndex);
        }
      }
    } else if (pointerView) {
      pointerView.setProgress(0);
    }
  };

  /**
   * Called whenever an object has been clicked
   * Stops the recalibration timer
   * @private
   */
  IndexView.prototype._onObjectClicked = function() {
    Chaplin.mediator.publish("instructions:start");
    if (this._recalibrationTimer) {
      clearInterval(this._recalibrationTimer);
    }
  };

  /**
   * Gets called everytime the user points at
   * the screen
   * @param  {Vector3} position
   * @private
   */
  IndexView.prototype._onPointRaw = function(position) {
    if (!this._pointing) {
      this._pointingBegan = Date.now();
      this._pointing = true;
    }

    this._lastPosition = position;
  };

  /**
   * Reset the progress on the pointer view
   * @private
   */
  IndexView.prototype._onPointEnded = function() {
    LeapViewMixin._onPointEnded.apply(this, arguments);

    this._pointing = false;

    var pointerView = this._calibrationPointer;
    if (pointerView) {
      pointerView.resetProgress();
    }
  };

  /**
   * Expose `IndexView`
   */
  module.exports = IndexView;
});
