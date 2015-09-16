"use strict";
define(function (require, exports, module) {
  /**
   * Module dependencies
   */
  var BaseView = require("views/base/view");
  var template = require("requirejs-text!templates/recipes/item.hbs");

  /**
   * RecipesItemView definition
   */
  var RecipesItemView = BaseView.extend({
    template: template,
    listen: {
      "addedToParent": "_addedToParent"
    },
    className: "box recipe",
    locals: {
      enableLeapOnImage: true
    }
  });

  /**
   * Gets called whenever this view gets added
   * to a new parent. Checks whether it's attached to
   * the body tag (== present in DOM), then resizes
   * texts to fit.
   * @private
   */
  RecipesItemView.prototype._addedToParent = function () {
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
   * Expose `RecipesItemView`
   */
  module.exports = RecipesItemView;
});
