"use strict";
define(function (require, exports, module) {
  /**
   * Module dependencies
   */
  var Backbone = require("backbone");
  require("backbone-relational");

  var _ = require("underscore");
  var Chaplin = require("chaplin");

  /**
   * BackboneRelational settings
   */
  Backbone.Relational.showWarnings = false;

  /**
   * Model definition
   */
  var Model = Backbone.RelationalModel.extend({
    idAttribute: "_id"
  });
  _.extend(Model.prototype, Chaplin.EventBroker);

  /**
   * Apply ajax pre-filters
   * @private
   */
  Model.prototype.initialize = function() {
    Backbone.RelationalModel.prototype.initialize.apply(this, arguments);
    $.ajaxPrefilter( function( options ) {
      options.xhrFields = {
        withCredentials: true
      };
    });
  };

  /**
   * Make sure backbone-relational disposal works fine
   * @private
   */
  Model.prototype.dispose = function () {
    if (this.disposed) return;
    this.trigger("relational:unregister", this, this.collection);
    Chaplin.Model.prototype.dispose.call(this);
  };

  /**
   * Adds getters to the `attributes` hash, calling instance methods
   * of our model. This will let us use functions as attributes in
   * our templates
   * @param {Object} decorators
   * @private
   */
  Model.prototype._addDecorators = function(decorators) {
    var decoratorFunction;

    for (var attribute in decorators) {
      decoratorFunction = decorators[attribute];
      this.attributes.__defineGetter__(attribute, decoratorFunction);
    }
  };

  /**
   * Expose `Model`
   */
  module.exports = Model;
});
