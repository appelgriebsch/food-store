"use strict";
define(function (require, exports, module) {
  /**
   * Module dependencies
   */
  var Chaplin = require("chaplin");
  var mediator = Chaplin.mediator;
  var BaseView = require("views/base/view");
  var template = require("requirejs-text!templates/shoppinglists/item.haml");
  var config = require("config");

  /**
   * ShoppingListsItemView definition
   */
  var ShoppingListsItemView = BaseView.extend({
    template: template,

    tagName: "div",

    events: {
      "click .social-facebook": "_onFacebookItemClick",
      "click .social-twitter": "_onTwitterItemClick"
    }
  });

  ShoppingListsItemView.prototype.getTemplateData = function() {
    var templateData = BaseView.prototype.getTemplateData.apply(this, arguments);

    templateData.isPromotional = function (item) {
      return item.price !== item.promo;
    };

    templateData.loggedIn = function (network) {
      var customer = templateData.shoppinglist.customer;
      return customer[network].data && customer[network].data.id;
    };

    return templateData;
  };

  /**
   * Gets called whenever the user clicks on the Facebook sharing button
   * @param  {Event} e
   * @private
   */
  ShoppingListsItemView.prototype._onFacebookItemClick = function(e) {
    var loading = this.$el.find(".loading-facebook");
    var target = $(e.target);
    var url = config.RESTURL + "facebook/post";
    var item = this.model.findItem(target.closest("li").data("id"));
    var message = this._generateSharingMessageForItem(item);
    var facebookCredentials = this.model.get("shoppinglist").get("customer").get("facebook");

    target.addClass("hidden");
    loading.addClass("visible");

    $.ajax(url, {
      crossDomain: true,
      xhrFields: {
        withCredentials: true
      },
      data: {
        token: facebookCredentials.token,
        message: message
      },
      type: "POST",
      complete: function () {
        target.removeClass("hidden");
        loading.removeClass("visible");
        mediator.publish("customer:update");
      },
      error: function (xhr, status, error) {
        throw error;
      }
    });
  };

  /**
   * Gets called whenever the user clicks on the Twitter sharing button
   * @param  {Event} e
   * @private
   */
  ShoppingListsItemView.prototype._onTwitterItemClick = function(e) {
    var loading = this.$el.find(".loading-twitter");
    var target = $(e.target);
    var url = config.RESTURL + "twitter/post";
    var item = this.model.findItem(target.closest("li").data("id"));
    var message = this._generateSharingMessageForItem(item);
    var twitterCredentials = this.model.get("shoppinglist").get("customer").get("twitter");

    target.addClass("hidden");
    loading.addClass("visible");

    $.ajax(url, {
      crossDomain: true,
      xhrFields: {
        withCredentials: true
      },
      data: {
        token: twitterCredentials.token,
        secret: twitterCredentials.secret,
        message: message
      },
      type: "POST",
      complete: function () {
        target.removeClass("hidden");
        loading.removeClass("visible");
        mediator.publish("customer:update");
      },
      error: function (xhr, status, error) {
        throw error;
      }
    });
  };

  /**
   * Generates a message for the given item that will be
   * shared on Facbeook or Twitter
   * @param  {Item} item
   * @return {String}
   * @private
   */
  ShoppingListsItemView.prototype._generateSharingMessageForItem = function(item) {
    return "I like the current offer of " + item.getFormattedPromo() + " for " + item.get("name") + " #easy_dinner #WincorWorld";
  };

  /**
   * Expose ShoppingListsItemView
   */
  module.exports = ShoppingListsItemView;
});
