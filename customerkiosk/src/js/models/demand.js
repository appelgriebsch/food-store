"use strict";
define(function (require, exports, module) {
  /**
   * Module dependencies
   */
  var Backbone = require("backbone");
  var BaseModel = require("models/base/model");
  var DemandItem = require("models/demand-item");
  var DemandItems = require("models/demand-items");

  /**
   * Model definition
   */
  var Demand = BaseModel.extend({
    relations: [{
      type: Backbone.HasMany,
      key: "itemJoins",
      keyDestination: "items",
      relatedModel: DemandItem,
      collectionType: DemandItems,
      reverseRelation: {
        key: "demand"
      }
    }]
  });

  /**
   * Finds the item with the given ID
   * @param  {Number} id
   * @return {Item}
   * @public
   */
  Demand.prototype.findItem = function(id) {
    var itemJoins = this.get("itemJoins");
    var itemIndex, itemJoin, item;

    for (var i = 0, len = itemJoins.length; i < len; i++) {
      itemJoin = itemJoins.at(i);
      item = itemJoin.get("item");
      if (item.get("_id") === id) return item;
    }

    return false;
  };

  /**
   * Expose `Demand`
   */
  module.exports = Demand;
});
