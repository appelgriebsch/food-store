"use strict";
define(function (require) {
  /**
   * Module dependencies
   */
  var Handlebars = require("handlebars");

  /**
   * Register partial
   */
  var recipeImagePartial = require("requirejs-text!templates/recipes/_image.hbs");
  Handlebars.registerPartial("recipeImage", recipeImagePartial);

  var recipeCoverPartial = require("requirejs-text!templates/recipes/_cover.hbs");
  Handlebars.registerPartial("recipeCover", recipeCoverPartial);
});
