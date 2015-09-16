"use strict";
define(function (require, exports, module) {
  /**
   * Module dependencies
   */
  var BaseCollectionView = require("views/base/collection-view");
  var ShoppingListsItemView = require("views/shoppinglists/item-view");
  var template = require("requirejs-text!templates/shoppinglists/show.haml");

  /**
   * ShoppingListsShowView definition
   */
  var ShoppingListsShowView = BaseCollectionView.extend({
    autoRender: true,
    template: template,

    itemView: ShoppingListsItemView,

    tagName: "div",
    id: "shoppinglist"
  });

  /**
   * Expose ShoppingListsShowView
   */
  module.exports = ShoppingListsShowView;
});
