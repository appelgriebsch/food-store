"use strict";
define(function (require, exports, module) {
  /**
   * Module dependencies
   */
  var BaseView = require("views/base/view");
  var template = require("requirejs-text!templates/ingredients/item.hbs");

  /**
   * IngredientsItemView definition
   */
  var IngredientsItemView = BaseView.extend({
    template: template,
    tagName: "li"
  });

  /**
   * Start listening to change events on our recipe
   * @private
   */
  IngredientsItemView.prototype.initialize = function () {
    BaseView.prototype.initialize.apply(this, arguments);

    var self = this;

    this._recipe = this.model.get("recipe");
    this.listenTo(this._recipe, "change:currentServedPersons", function () {
      self._onServedPersonChanged.apply(self, arguments);
    });
  };

  /**
   * Gets called everytime the `servedPersons` property of the
   * recipe this ingredient belongs to changed
   * @private
   */
  IngredientsItemView.prototype._onServedPersonChanged = function () {
    var servedPersons = this._recipe.get("currentServedPersons");
    var amountContainer = this.$el.find(".ingredient-amount");
    var itemContainer = this.$el.find(".ingredient-item");

    amountContainer.text(this.model.get("amount"));
    itemContainer.text(this.model.get("name"));
  };

  /**
   * Expose `IngredientsItemView`
   */
  module.exports = IngredientsItemView;
});
