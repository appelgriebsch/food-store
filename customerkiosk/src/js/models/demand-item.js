"use strict";
define(function (require, exports, module) {
  /**
   * Module dependencies
   */
  var Backbone = require("backbone");
  var BaseModel = require("models/base/model");
  var Item = require("models/item");

  /**
   * Model definition
   */
  var DemandItem = BaseModel.extend({
    relations: [
      {
        type: Backbone.HasOne,
        key: "item",
        relatedModel: Item,
        reverseRelation: {
          key: "demandJoin"
        }
      }
    ]
  });

  /**
   * Expose `DemandItem`
   */
  module.exports = DemandItem;
});
