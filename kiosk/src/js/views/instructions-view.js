"use strict";
define(function (require, exports, module) {
  /**
   * Module dependencies
   */
  var Backbone = require("backbone");
  var Chaplin = require("chaplin");
  var BaseView = require("views/base/view");
  var template = require("requirejs-text!templates/instructions.hbs");

  /**
   * Settings
   */
  var MAX_IDLE = 60000;

  /**
   * InstructionsView definition
   */
  var InstructionsView = BaseView.extend({
    autoRender: true,
    template: template,

    el: "#instructions",

    listen: {
      "leap:point mediator": "_onPoint",
      "leap:circle mediator": "_onCircle",
      "leap:move mediator": "_onMove",
      "recipe:persons_changed mediator": "_onPersonsChanged",
      "leap:object_clicked mediator": "_onObjectClicked",
      "instructions:start mediator": "_startInstructions",
      "instructions:start_if_needed mediator": "_startIfNeeded",
      "instructions:stop mediator": "_stopInstructions"
    }
  });

  InstructionsView.prototype.initialize = function() {
    BaseView.prototype.initialize.apply(this, arguments);

    var self = this;
    this._lastInput = Date.now() - MAX_IDLE;
    this._initialInstruction = "move";
    this._idleInterval = setInterval(function () {
      self._checkForIdle();
    }, 1000);
  };

  /**
   * Start the instructions / show the move instruction
   * @private
   */
  InstructionsView.prototype._startInstructions = function() {
    var self = this;

    this._reset();

    // Show the instructions wrapper
    this.$el.addClass("visible");

    // After 500ms, show the first instruction
    setTimeout(function () {
      self._showInstruction(self._initialInstruction);
    }, 500);
  };

  /**
   * If the instructions are already running, switch back
   * to the "move" instruction.
   * If they are not running, only start the instructions
   * if the user is idling
   * @return {[type]} [description]
   */
  InstructionsView.prototype._startIfNeeded = function() {
    if (this._running && this._currentInstruction !== this._initialInstruction) {
      this._startInstructions();
    } else {
      this._checkForIdle();
    }
  };

  /**
   * Hides everything
   * @private
   */
  InstructionsView.prototype._stopInstructions = function() {
    if (!this._running) return;

    this._running = false;

    this.$el.find(".instruction").removeClass("visible");
    this.$el.removeClass("visible");
  };

  /**
   * Show the given instruction
   * @param  {String} instruction
   * @private
   */
  InstructionsView.prototype._showInstruction = function(instruction) {
    var showDelay = 0;
    var self = this;

    this._currentInstruction = instruction;

    // Is there a visible instruction? Hide it first,
    // increase the delay until the new instruction is shown.
    if (this.$el.find(".instruction.visible").length) {
      this.$el.find(".instruction").removeClass("visible");
      showDelay = 800;
    }

    // Show the current instruction after a delay
    setTimeout(function () {
      self.$el.find("#instructions-" + instruction).addClass("visible");
    }, showDelay);
  };

  /**
   * Gets called whenever we get a move event from the
   * leap wrapper. If the user is currently viewing the
   * "move" instruction and the position offset of our
   * view is high enough, we switch to the click
   * instruction.
   * @private
   */
  InstructionsView.prototype._onMove = function() {
    if(!this._running) return;

    this._lastInput = Date.now();

    if (this._currentInstruction === "move" && $("#recipes-index").position().left < -200) {
      this._showInstruction("click");
    }
  };

  /**
   * Register point events to update `_lastInput`
   * @private
   */
  InstructionsView.prototype._onPoint = function() {
    this._lastInput = Date.now();
  };

  /**
   * Register circle events to update `_lastInput`
   * @private
   */
  InstructionsView.prototype._onCircle = function() {
    this._lastInput = Date.now();
  };

  /**
   * Gets called when the user changes the amount of persons
   * @private
   */
  InstructionsView.prototype._onPersonsChanged = function () {
    if (this._currentInstruction === "circle") {
      this._stopInstructions();
    }
  };

  /**
   * Gets called whenever the user has clicked an object
   * @private
   */
  InstructionsView.prototype._onObjectClicked = function(obj) {
    if(!this._running) return;

    if (obj.attr("id") !== "back") {
      this._showInstruction("circle");
    }
  };

  /**
   * Checks whether the user idled for a long
   * time, shows instructions
   * @private
   */
  InstructionsView.prototype._checkForIdle = function() {
    if (Chaplin.mediator.calibrating) return;

    // Return back to overview and reset the instructions
    // if the user has been inactive for a while. Don't switch
    // back if we are already on the initial instruction
    if (Date.now() - this._lastInput > MAX_IDLE) {
      if (Backbone.history.fragment !== "") {
        Chaplin.helpers.redirectTo("recipes#index");
      }
      if (this._currentInstruction !== this._initialInstruction) {
        this._startInstructions();
      }
    }
  };

  /**
   * Resets all state variables etc
   * @private
   */
  InstructionsView.prototype._reset = function() {
    this.$el.find(".instruction").removeClass("visible");
    this._currentInstruction = null;
    this._running = true;
  };

  /**
   * Expose `InstructionsView`
   */
  module.exports = InstructionsView;
});
