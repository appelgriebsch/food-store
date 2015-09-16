"use strict";
define(function (require, exports, module) {
  /**
   * Module dependencies
   */
  var BaseCollectionView = require("views/base/collection-view");
  var IngredientsItemView = require("views/ingredients/item-view");

  /**
   * IngredientsListView definition
   */
  var IngredientsListView = BaseCollectionView.extend({
    itemView: IngredientsItemView,
    tagName: "ul"
  });

  /**
   * Expose `IngredientsListView`
   */
  module.exports = IngredientsListView;
});
