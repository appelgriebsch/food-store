"use strict";
define(function (require, exports, module) {
  /**
   * Module dependencies
   */
  var Chaplin = require("chaplin");
  var ShoppingList = require("models/shoppinglist");
  var ShoppingListsShowView = require("views/shoppinglists/show-view");

  /**
   * ShoppingListsController definition
   */
  var ShoppingListsController = Chaplin.Controller.extend({});

  /**
   * Compose Site, sidebar and sharing overlay
   * @private
   */
  ShoppingListsController.prototype.beforeAction = function(params) {
    var SidebarView = require("views/shared/sidebar-view");
    var SharingOverlayView = require("views/shared/sharing-overlay-view");
    var Site = require("views/shared/site-view");
    var self = this;

    this.shoppinglist = new ShoppingList({
      id: params.id,
      user: params.user
    });

    this.compose("site", Site);

    this.shoppinglist
      .fetch({
        error: function (model, res) {
          if (res.status === 404) {
            alert("Shoppinglist could not be found! Returning to splash page.");
          } else {
            alert("Error: " + res.status + "! Returning to splash page.");
          }
          Chaplin.helpers.redirectTo("index#index");
        }
      })
      .then(function () {
        return self.shoppinglist.get("customer").fetchFriendlists();
      })
      .then(function () {
        self.compose("sidebar", SidebarView, {
          region: "sidebar",
          model: self.shoppinglist
        });

        self.compose("sharing-overlay", SharingOverlayView, {
          region: "sharing-overlay",
          model: self.shoppinglist
        });
      });
  };

  /**
   * GET /shoppinglists/:id
   */
  ShoppingListsController.prototype.show = function() {
    var self = this;

    self.view = new ShoppingListsShowView({
      collection: self.shoppinglist.get("results"),
      region: "body"
    });
  };

  /**
   * Expose ShoppingListsController
   */
  module.exports = ShoppingListsController;
});
