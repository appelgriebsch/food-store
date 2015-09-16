"use strict";
define(function (require, exports, module) {
  /**
   * Module dependencies
   */
  var Chaplin = require("chaplin");
  var Recipes = require("models/recipes");

  /**
   * Preload partials
   */
  require("views/recipes/_partials");

  /**
   * RecipesController definition
   */
  var RecipesController = Chaplin.Controller.extend({
    /**
     * Redirect to calibration scren unless the screen
     * has been calibrated already
     * Fetch recipes if necessary
     * @param  {Route}  route
     * @private
     */
    beforeAction: function () {
      if (!RecipesController.recipes) {
        var recipes = new Recipes();

        RecipesController.recipes = recipes;

        return recipes.fetch();
      } else {
        return null;
      }
    },

    /**
     * GET /
     * @public
     */
    index: function () {
      // Did we calibrate the screen?
      var leapController = Chaplin.mediator.leapController;
      var leapCalibrated = !leapController.calibratedScreens().empty();

      if (!leapCalibrated) {
        return Chaplin.helpers.redirectTo("calibration#index");
      } else {
        Chaplin.mediator.publish("instructions:start_if_needed");
      }

      var IndexView = require("views/recipes/index-view");
      var recipes = RecipesController.recipes;

      this.view = new IndexView({
        collection: recipes
      });

      recipes.fetch();
    },

    /**
     * GET /recipes/:id
     * @param  {Object} params
     * @public
     */
    show: function (params) {
      var ShowView = require("views/recipes/show-view");
      var recipe = RecipesController.recipes.get(params.id);

      this.view = new ShowView({
        model: recipe
      });
    }
  });

  /**
   * Expose `RecipesController`
   */
  module.exports = RecipesController;
});
