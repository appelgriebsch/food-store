"use strict";
define(function (require, exports, module) {
  /**
   * Module dependencies
   */
  var Backbone = require("backbone");
  var config = require("config");
  var BaseModel = require("models/base/model");
  var Friendlist = require("models/friendlist");
  var Friendlists = require("models/friendlists");

  /**
   * Model definition
   */
  var Customer = BaseModel.extend({
    relations: [{
      type: Backbone.HasMany,
      key: "friendlists",
      relatedModel: Friendlist,
      relatedCollection: Friendlists,
      reverseRelation: {
        key: "customer"
      }
    }],
    url: function () {
      return config.RESTURL + "/customers/" + this.get("user_name");
    }
  });

  /**
   * Fetches the friend lists
   * TODO: Find a better solution for this. This is quite hacky.
   * @return {Promise}
   */
  Customer.prototype.fetchFriendlists = function () {
    var friendlists = this.get("friendlists");
    var config = require("config");

    friendlists.url = config.RESTURL + "facebook/friendLists?token=" + this.get("facebook").token;
    friendlists.parse = function (data) {
      return data.data;
    };

    return friendlists.fetch();
  };

  /**
   * Checks whether the customer is logged in with the given network
   * @param  {String} network
   * @return {Boolean}
   */
  Customer.prototype.loggedIn = function (network) {
    var networkAttribute = this.get(network);
    return networkAttribute.data && networkAttribute.data.id;
  };

  /**
   * Extracts the actual model data from the given data
   * @param  {Object} data
   * @return {Object}
   * @private
   */
  Customer.prototype.parse = function (data) {
    return data.data;
  };

  /**
   * Expose `Customer`
   */
  module.exports = Customer;
});
