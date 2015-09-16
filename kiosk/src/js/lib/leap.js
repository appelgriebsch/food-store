"use strict";
define(function (require, exports) {
  /**
   * Module dependencies
   */
  var Chaplin = require("chaplin");
  var mediator = Chaplin.mediator;

  /**
   * Configuration
   */
  var BUFFER_SIZE = 10;
  var MAX_Z_FOR_GESTURES = 50; // Center of the Leap's area

  /**
   * A wrapper for LeapJS handling gestures and
   * movements
   */
  function LeapWrapper() {
    this.frameBuffer = [-1];
    this.pointPositionBuffer = [];
    this.pointingPosition = new Leap.Vector();
    this.lastClick = 0;

    var self = this;

    this._listener = new Leap.Listener();

    this._controller = new Leap.Controller("ws://localhost:6437/");
    this._controller.enableGesture("circle", true);
    this._controller.addListener(this._listener);

    if (!this._controller.calibratedScreens().empty()) {
      this._screen = this._controller.calibratedScreens()[0];
    }

    this._listener.onFrame = function () {
      self._onFrame.apply(self, arguments);
    };
  }

  /**
   * Processes a frame sent by the Leap
   * @param {LeapMotion.Controller} controller
   * @private
   */
  LeapWrapper.prototype._onFrame = function (controller) {
    if (this.paused) return;

    var frame = controller.frame();
    var moveHandled = this._handleMove(frame);
    var pointHandled = false;

    // Not moving - try pointing / gestures
    if (!moveHandled) {
      pointHandled = this._handlePoint(frame);
      this._handleGestures(frame);
    }

    // Toggle pointing
    if (pointHandled && !this.pointing) {
      this.pointing = true;
    } else if(!pointHandled && this.pointing) {
      this.pointing = false;
      mediator.publish("leap:point_ended");
    }

    // Buffer a couple of frames - limit to BUFFER_SIZE
    this.frameBuffer.push(frame);
    if (this.frameBuffer.length > BUFFER_SIZE) {
      this.frameBuffer = this.frameBuffer.slice(1);
    }
  };

  /**
   * Emits a `move` event in case the frame passes some
   * sanity checks / validations.
   * @param  {Leap.Frame} frame
   * @return {Boolean}
   * @private
   */
  LeapWrapper.prototype._handleMove = function (frame) {
    var hands = frame.hands();
    var hand, zPositionOK, fingerCountOK;

    // Skip if we don't have hands
    // Because no hands == no cookies.
    if (hands.length === 0) {
      return false;
    }

    // Frame / hand validations
    // Check whether the z position is okay (the user has
    // to put it through some kind of invisible wall) and
    // whether we recognized enough fingers for a move event
    for (var i = 0; i < hands.length; i++) {
      hand = hands[i];
      zPositionOK = false;
      fingerCountOK = false;

      // Z position check
      zPositionOK = hand.palmPosition().z < MAX_Z_FOR_GESTURES;

      // Fingers count check
      fingerCountOK = Math.abs(hand.palmNormal().x) > 0.7 ||
        hand.fingers().length >= 3;

      if (zPositionOK && fingerCountOK) {
        break;
      }
    }

    if (zPositionOK && fingerCountOK) {
      // Calculate the average distance per frame of the last
      // buffered frames (== smoothing)
      var translation = frame.translation(this.frameBuffer[0]);

      // Emit a move event
      mediator.publish("leap:move",
        new Leap.Vector(translation)
      );

      // We handled this frame as a movement
      return true;
    } else {
      // No handling happened.
      return false;
    }
  };

  /**
   * Emits a `point` event in case the frame passes some sanity
   * checks / validations
   * @param  {Leap.Frame} frame
   * @return {Boolean}
   * @private
   */
  LeapWrapper.prototype._handlePoint = function (frame) {
    var hands = frame.hands();
    var fittingPointables = [];
    var pointable;
    var normedPointingPosition;

    // Find pointables
    for (var i = 0; i < hands.length; i++) {
      var hand = hands[i];

      // We don't want hands with more than 2 pointables
      if (hand.pointables().length <= 2) {
        var pointables = hand.pointables();
        for (var j = 0; j < pointables.length; j++) {
          var currentPointable = pointables[j];

          // Check for the Z barrier
          if (currentPointable.tipPosition().z < MAX_Z_FOR_GESTURES) {
            fittingPointables.push(currentPointable);
          }
        }
      }
    }

    // No pointables? No pointing!
    if (fittingPointables.length === 0) return false;

    // Sort pointables by z position
    fittingPointables.sort(function (a, b) {
      return a.tipPosition().z - b.tipPosition().z;
    });

    // We want the pointable that's closest to the screen
    pointable = fittingPointables[0];

    if (this._screen) {
      var projection = this._screen.project(pointable, true);
      normedPointingPosition = new Leap.Vector(projection.position);

      mediator.publish("leap:point", normedPointingPosition);
    }

    mediator.publish("leap:point:raw", pointable.tipPosition());

    return true;
  };

  /**
   * Emits gesture events in case they are present
   * @param  {LeapMotion.Frame} frame [description]
   * @return {[type]}       [description]
   * @private
   */
  LeapWrapper.prototype._handleGestures = function(frame) {
    var gestures = frame.gestures();
    var circles = [];

    if (!gestures || !gestures.length) {
      return false;
    }

    // Delegate events and collect circles
    for (var i = 0; i < gestures.length; i++) {
      var gesture = gestures[i];
      switch (gesture.type()) {
        case "circle":
          circles.push([gesture, frame]);
          break;
      }
    }

    if (circles.length > 0) {
      this._onCircle(circles);
    }

    return true;
  };

  /**
   * Emits a circle event
   * @param  {Leap.Gesture} gestures
   * @return {Leap.Frame}
   * @private
   */
  LeapWrapper.prototype._onCircle = function(gestures) {
    var gesture;
    var frame;

    if (gestures.length <= 2) {
      gesture = gestures[0][0];
      frame   = gestures[0][1];

      /**
       * Is this a clockwise movement?
       */
      if (frame.pointables().length > 0) {
        var pointable = frame.pointables()[0];
        var direction = pointable.direction();
        gesture.clockwise = direction.dot(gesture.normal()) > 0;
      }

      mediator.publish("leap:circle", gesture, frame);
    }
  };

  /**
   * Expose `getLeap`, a method that returns a singleton
   */
  exports.getLeap = function () {
    if (!LeapWrapper.singleton) {
      LeapWrapper.singleton = new LeapWrapper();
    }
    return LeapWrapper.singleton;
  };
});
