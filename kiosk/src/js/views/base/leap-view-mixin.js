"use strict";
define(function (require, exports, module) {
  /**
   * Module dependencies
   */
  var Chaplin = require("chaplin");
  var requestAnimFrame = require("../../lib/animframe").requestAnimFrame;
  var cancelAnimFrame = require("../../lib/animframe").cancelAnimFrame;
  var PointerView = require("views/shared/pointer-view");
  var Rect = require("../../lib/math/rect");
  var mediator = Chaplin.mediator;

  /**
   * Settings
   */
  var CLICK_DURATION = 1000;

  /**
   * LeapView definition
   */
  var LeapView = {
    listen: {
      "leap:point mediator": "_onPoint",
      "leap:point_ended mediator": "_onPointEnded",
      "leap:circle mediator": "_onCircle",
      "leap:move mediator": "_onMove"
    },

    /**
     * Start listening to move events
     */
    initialize: function () {
      this.constructor.__super__.initialize.apply(this, arguments);

      this._running = true;

      this._camera = new Leap.Vector();
      this._velocity = new Leap.Vector();
      this._toVelocity = new Leap.Vector();
      this._toCamera = new Leap.Vector();

      this._pointing = false;
      this._pointingBegan = 0;

      this._intersecting = false;
      this._intersectionBegan = 0;

      this._enableMoving = true;
      this._enablePointing = true;

      this._moveToFixed = false;
    },

    /**
     * Add the pointer div, afterwards handle leap-activated DOM elements
     * @public
     */
    render: function () {
      this.constructor.__super__.render.apply(this, arguments);

      // Create the pointer
      this._createPointer();

      // Find leap-activated objects
      this._leapDomObjects = this.$el.find("[data-leap]");

      // Find the leap canvas that we move
      if (this.$el.data("leap-scroll-view")) {
        this._leapCanvas = this.$el;
      } else {
        this._leapCanvas = this.$el.find("[data-leap-scroll-view]");
      }

      // Find the back indicator
      this._backIndicator = this.$el.find("#back");

      // Run update loop
      this._update(0);
    },

    /**
     * Updates the position and calculates the new velocity
     * @private
     */
    _update: function () {
      var self = this;
      var minX, maxX;

      // Only update the camera position if the content is
      // larger than the window size
      if (this._leapCanvas.outerWidth() > $(window).width()) {
        if (this._moveToFixed) {
          // Move to a fixed point
          this._camera.x += (this._toCamera.x - this._camera.x) / 10;
        } else if (this._velocity.x) {
          // Move using velocity
          this._camera.x += this._velocity.x;
          this._velocity.x += (this._toVelocity.x - this._velocity.x) / 8;

          /**
           * Position boundaries
           */
          minX = 0;
          maxX = this._leapCanvas.outerWidth() - $(window).width();

          // Only apply lower boundary if we are moving left
          // This is due to the "back" capability
          if (this._velocity.x < 0) {
            this._camera.x = Math.max(minX, this._camera.x);
          }

          // Apply upper boundary
          this._camera.x = Math.min(this._camera.x, maxX);
        }

        // Update the transform / positioning
        this._setPosition();
      }

      // Draw the progress on the pointer canvas
      if (this._intersecting) {
        var timePassed = Date.now() - this._intersectionBegan;
        var progress = Math.min(1, timePassed / CLICK_DURATION);

        this._pointerView.setProgress(progress);

        // If the user pointed on the object long
        // enough, click the object
        if (Date.now() - this._intersectionBegan >= CLICK_DURATION) {
          this._currentLeapDomObject.click();
          this._pointing = false;
          this._intersecting = false;

          mediator.publish("leap:object_clicked", this._currentLeapDomObject);
        }
      } else {
        this._pointerView.resetProgress();
      }

      if (this._running) {
        this._animFrame = requestAnimFrame(function () {
          self._update.apply(self, arguments);
        });
      }
    },

    /**
     * Create the pointer and the canvas that
     * we draw our ellipse on
     * @private
     */
    _createPointer: function () {
      this._pointerView = new PointerView({
        container: $("body")
      });
      this.subview("pointer", this._pointerView);
    },

    /**
     * Gets called everytime our Leap wrapper emits a circle event
     * @param  {Leap.Gesture} gesture
     * @param  {Leap.Frame} frame
     * @private
     */
    _onCircle: function (gesture, frame) {

    },

    /**
     * Gets called everytime our Leap wrapper emits a move event
     * Recalculates positions and velocities
     * @param {Leap.Vector} position
     * @private
     */
    _onMove: function (position) {
      if (!this._enableMoving) return;

      this._velocity.x = -position.x;
      this._toVelocity.x = 0;

      // As soon as the user takes back the control
      // by trying to move, stop moving to a fixed
      // point (this will cause control by velocity)
      if (this._moveToFixed) {
        this._moveToFixed = false;
      }
    },

    /**
     * Gets called everytime our Leap wrapper emits a point event
     * Shows the pointer and updates its position
     * @param  {Leap.Vector} position
     * @private
     */
    _onPoint: function (position) {
      // Actual pointing begins 500ms after the
      // user has started pointing. We are doing this
      // so that we don't show the pointer by accident
      if (!this._pointing) {
        this._pointingBegan = Date.now();
        this._pointing = true;
      }

      if (!this._enablePointing) return;

      if (Date.now() - this._pointingBegan >= 150) {
        // Move the pointer div
        this._pointerView.move({
          left: position.x,
          top: position.y
        });
        this._pointerView.show();

        // Check whether the position intersects with
        // one of our leap objects
        var intersectingRightNow = this._checkDomIntersections(position);
        if (intersectingRightNow && !this._intersecting) {
          this._intersecting = true;
          this._intersectionBegan = Date.now();
        } else if (!intersectingRightNow) {
          this._intersecting = false;
          this._intersectionBegan = 0;
        }
      }
    },

    /**
     * Gets called everytime our Leap wrapper emits a point_ended event
     * Hides the pointer
     * @private
     */
    _onPointEnded: function () {
      this._pointing = false;
      this._intersecting = false;
      this._currentLeapDomObject = null;

      if (!this._enablePointing) return;

      this._pointerView.hide();
    },

    /**
     * Sets the css transforms of our container
     * @private
     */
    _setPosition: function () {
      var leapCanvas = this._leapCanvas;
      var css = {};
      var prefixes = ["-webkit-", "-moz-", "-o-", "-ms-", ""];
      var value;
      value = "translate3d(" + (-this._camera.x) + "px, 0, 0)";

      // Adds transform property for all browser prefixes
      for (var i = 0; i < prefixes.length; i++) {
        var prefix = prefixes[i];
        css[prefix + "transform"] = value;
      }

      leapCanvas.css(css);
    },

    /**
     * Checks whether the given position intersects with
     * a leap-activated dom object on the screen.
     * In case it does, it stores the highlighted object
     * inside `_currentLeapDomObject`
     * @param  {Leap.Vector} position
     * @return {Boolean}
     * @private
     */
    _checkDomIntersections: function (position) {
      var intersecting = false;
      var $obj, box;

      for (var i = 0; i < this._leapDomObjects.length; i++) {
        $obj = this._leapDomObjects.eq(i);
        box = new Rect(
            $obj.offset().left,
            $obj.offset().top,
            $obj.width(),
            $obj.height()
          );

        if (box.intersectsWithVector(position)) {
          this._currentLeapDomObject = $obj;
          intersecting = true;

          if (typeof this._onPointIntersection === "function") {
            this._onPointIntersection($obj);
          }

          break;
        }
      }

      // No intersections?
      if (!intersecting) {
        this._currentLeapDomObject = null;

        if (typeof this._onPointNonIntersection === "function") {
          this._onPointNonIntersection($obj);
        }
      }

      return intersecting;
    },

    /**
     * Stop listening to events
     */
    dispose: function () {
      // Stop the update loop
      this._running = false;
      if (this._animFrame) {
        cancelAnimFrame(this._animFrame);
      }

      this.constructor.__super__.dispose.apply(this, arguments);
    }
  };

  /**
   * Expose `LeapView`
   */
  module.exports = LeapView;
});
