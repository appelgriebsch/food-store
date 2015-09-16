"use strict";
define(function (require, exports, module) {
  /**
   * Module dependencies
   */
  var Chaplin = require("chaplin");
  var BaseView = require("views/base/view");
  var LeapViewMixin = require("views/base/leap-view-mixin");
  var IngredientsListView = require("views/ingredients/list-view");
  var template = require("requirejs-text!templates/recipes/show.hbs");

  /**
   * ShowView definition
   */
  var ShowView = BaseView.extend({
    template: template,
    autoRender: true,

    container: "div#app-container",

    id: "recipes-show-wrapper",

    regions: {
      ingredients: "#recipe-ingredients"
    },

    listen: {
      "addedToDOM": "_addedToDOM",
      "change:currentServedPersons model": "_servedPersonsChanged"
    },

    events: {
      "click  #back": "_onBack"
    }
  }).extend(LeapViewMixin);

  /**
   * Get the persons control and the actual container,
   * create the ingredients subview
   */
  ShowView.prototype.render = function () {
    LeapViewMixin.render.apply(this, arguments);

    this._personsControl = this.$el.find("#persons-control");
    this._realContainer = this.$el.find("#recipes-show");

    this.subview("ingredients", new IngredientsListView({
      collection: this.model.get("ingredients"),
      autoRender: true,
      region: "ingredients"
    }));

    this._qrcode = new QRCode(this.$el.find("#ingredients-qrcode").get(0), {
      text: this._getQRJSON(),
      width: 192,
      height: 192,
      colorLight: "transparent",
      colorDark: "#494320"
    });
  };

  /**
   * Handle the snapping by moving to a fixed point
   * if we didn't get a move event for 1 second
   * @private
   */
  ShowView.prototype._update = function () {
    LeapViewMixin._update.apply(this, arguments);

    if (!this._lastMove) this._lastMove = Date.now();
    if (!this._lastCircle) this._lastCircle = Date.now();

    // If we didn't get a move event for 1000ms and we
    // are off the screen (due to "back" capability),
    // move back to the starting point
    if (Date.now() - this._lastMove >= 1000 && this._camera.x < 0) {
      this._toCamera = new Leap.Vector();
      this._moveToFixed = true;
    }

    // If we didn't get a circle event for 1000ms,
    // stop displaying the persons control
    if (Date.now() - this._lastCircle >= 500) {
      this._personsChanging = false;
      this._personsControl.removeClass("visible");
      this._realContainer.removeClass("faded");
    }
  };

  /**
   * Reset the `_lastMove` value
   * @private
   */
  ShowView.prototype._onMove = function () {
    LeapViewMixin._onMove.apply(this, arguments);

    this._lastMove = Date.now();
  };

  /**
   * Avoid pointing when user is currently changing
   * the amount of persons served
   * @private
   */
  ShowView.prototype._onPoint = function () {
    if (!this._personsChanging) {
      LeapViewMixin._onPoint.apply(this, arguments);
    } else {
      // Make sure we're not pointing - hide the
      // pointer div
      this._onPointEnded();
    }
  };

  /**
   * Detect circular movement, change served persons
   * @param  {Leap.Gesture} gesture
   * @private
   */
  ShowView.prototype._onCircle = function(gesture) {
    LeapViewMixin._onCircle.apply(this, arguments);

    if (gesture.state() === "start" && gesture.radius() >= 30) {
      this._personsChanging = true;

      // We need to store whether the gesture is clockwise
      // or not because the value is not stable (thanks LEAP!)
      this._personsChangingClockwise = gesture.clockwise;

      this._initialServedPersons = this.model.get("currentServedPersons");
    } else if (gesture.state() === "update" && this._personsChanging && gesture.progress() >= 1.5) {
      var servedPersons = Math.round(gesture.progress() - 1.5);

      Chaplin.mediator.publish("recipe:persons_changed");

      // Show the persons control
      this._personsControl.addClass("visible");
      this._realContainer.addClass("faded");

      // If we move counter-clockwise, we want to decrease
      // the amount of persons served
      if (!this._personsChangingClockwise) {
        servedPersons *= -1;
      }

      var newServedPersons = this._initialServedPersons + servedPersons;

      // Boundaries
      newServedPersons = Math.max(1, newServedPersons);

      // Update the model
      this.model.set("currentServedPersons", newServedPersons);
    }

    this._lastCircle = Date.now();
  };

  /**
   * Gets called whenever this view gets added
   * to a new parent. Checks whether it's attached to
   * the body tag (== present in DOM), then resizes
   * texts to fit.
   * @private
   */
  ShowView.prototype._addedToDOM = function () {
    // The view has to be present in the DOM tree
    // so that we know the actual dimensions of our
    // text containers. Then we are able to resize
    // the text until it fits into the containers.
    if (this.$el.parents("body").length) {
      var recipeNameDiv = this.$el.find(".recipe-name");
      this._resizeTextToFit(recipeNameDiv);
    }
  };

  /**
   * Gets called everytime `servedPersons` changes
   * @private
   */
  ShowView.prototype._servedPersonsChanged = function () {
    var persons = this.model.get("currentServedPersons");
    this._personsControl.find("#persons").text(persons);

    this._qrcode.clear();
    this._qrcode.makeCode(this._getQRJSON());

    this.$el.find(".recipe-persons").text(persons);
  };

  /**
   * Returns the JSON-encoded information rendered
   * into the QR code
   * @return {String}
   */
  ShowView.prototype._getQRJSON = function() {
    return JSON.stringify({
        i: this.model.get("_id"),
        p: this.model.get("currentServedPersons")
    });
  };

  /**
   * Gets called when the back button has been clicked
   * @private
   */
  ShowView.prototype._onBack = function() {
    Chaplin.helpers.redirectTo("recipes#index");
  };

  /**
   * Clean up!
   * @private
   */
  ShowView.prototype.dispose = function() {
    // Reset current served persons to the initial value
    this.model.set("currentServedPersons", this.model.get("servedPersons"));

    LeapViewMixin.dispose.apply(this, arguments);
  };

  /**
   * Expose `ShowView`
   */
  module.exports = ShowView;
});
