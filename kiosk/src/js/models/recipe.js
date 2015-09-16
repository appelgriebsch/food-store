"use strict";
define(function (require, exports, module) {
  /**
   * Module dependencies
   */
  var Backbone = require("backbone");
  var Config = require("config");
  var Model = require("models/base/model");
  var Ingredient = require("models/ingredient");
  var Ingredients = require("models/ingredients");
  var Step = require("models/step");
  var Steps = require("models/steps");

  /**
   * Model definition
   */
  var Recipe = Model.extend({
    defaults: {
      "name": "",
      "servedPersons": 1, // Default servings (1 person)
      "durationInMinutes": 10, // Duration in minutes
      "photo": ""
    },
    relations: [{
      type: Backbone.HasMany,
      key: "ingredients",
      relatedModel: Ingredient,
      collectionType: Ingredients,
      reverseRelation: {
        key: "recipe"
      }
    }, {
      type: Backbone.HasMany,
      key: "steps",
      relatedModel: Step,
      collectionType: Steps
    }]
  });

  /**
   * Add decorators on initialization
   * @private
   */
  Recipe.prototype.initialize = function() {
    Model.prototype.initialize.apply(this, arguments);

    // Add some "fake" attributes
    this._addDecorators({
      photoUrl: this._getPhotoUrl
    });

    this.set("currentServedPersons", this.get("servedPersons"));
  };

  /**
   * Returns the absolute photo url
   * @return {String}
   * @private
   */
  Recipe.prototype._getPhotoUrl = function() {
    return Config.RESTURL + this.photo;
  };

  /**
   * Expose `Recipe`
   */
  module.exports = Recipe;
});
