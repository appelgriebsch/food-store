"use strict";
define(function (require, exports, module) {
  /**
   * Module dependencies
   */
  var Backbone = require("backbone");
  var _ = require("underscore");
  var Config = require("config");
  var BaseModel = require("models/base/model");
  var Demand = require("models/demand");
  var Demands = require("models/demands");
  var Customer = require("models/customer");

  /**
   * Model definition
   */
  var ShoppingList = BaseModel.extend({
    relations: [{
      type: Backbone.HasMany,
      key: "results",
      relatedModel: Demand,
      collectionType: Demands,
      reverseRelation: {
        key: "shoppinglist"
      }
    }, {
      type: Backbone.HasOne,
      key: "customer",
      relatedModel: Customer,
      reverseRelation: {
        type: Backbone.HasMany,
        key: "shoppinglist"
      }
    }]
  });

  /**
   * Returns the URL for this specific shopping list
   * @return {String}
   * @private
   */
  ShoppingList.prototype.url = function () {
    return Config.RESTURL + "itemlist/" + this.get("user") + "/" + this.get("id");
  };

  /**
   * Extracts the actual model data from the given data
   * @param  {Object} data
   * @return {Object}
   * @private
   */
  ShoppingList.prototype.parse = function (data) {
    data = data.data;

    data.results.forEach(function (result) {
      result.itemJoins = _.map(result.items, function (item) {
        return { item: item };
      });
      delete result.items;
    });

    return data;
  };

  /**
   * Expose `ShoppingList`
   */
  module.exports = ShoppingList;
});
