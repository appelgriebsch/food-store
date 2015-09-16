"use strict";
define(function (require, exports, module) {
  /**
   * Module dependencies
   */
  var Chaplin = require("chaplin");
  var mediator = Chaplin.mediator;
  var BaseView = require("views/base/view");
  var template = require("requirejs-text!templates/shared/sidebar.haml");
  var async = require("async");
  var config = require("config");

  /**
   * SidebarView definition
   */
  var SidebarView = BaseView.extend({
    template: template,

    events: {
      "click #sidebar-share": "_onShareClick",
      "click #sidebar-check-in": "_onCheckInClick"
    },

    listen: {
      "customer:update mediator": "_onCustomerUpdate"
    }
  });

  SidebarView.prototype.initialize = function() {
    BaseView.prototype.initialize.apply(this, arguments);

    this._checkingIn = false;
  };

  /**
   * Gets called as soon as the "Share List" button inside
   * the sidebar has been clicked
   * @private
   */
  SidebarView.prototype._onShareClick = function(e) {
    e.preventDefault();
    mediator.publish("open-share-dialog");
  };

  /**
   * Gets claled as soon as the "Check In" button inside
   * the sidebar has been clicked
   * @private
   */
  SidebarView.prototype._onCheckInClick = function(e) {
    e.preventDefault();

    var target = $(e.target);
    var icon = target.find(".btn-icon");
    var loading = target.find(".btn-loading");
    var jobs = [];
    var self = this;

    /** Make sure we are not checking in already **/
    if (this._checkingIn) return;
    this._checkingIn = true;

    /** Animation **/
    icon.addClass("hidden");
    loading.addClass("visible");

    /** Add jobs for FB and Twitter (if logged in) */
    var customer = this.model.get("customer");
    var facebookLoggedIn = customer.loggedIn("facebook");
    var twitterLoggedIn = customer.loggedIn("twitter");

    if (!(facebookLoggedIn || twitterLoggedIn)) {
      self._checkingIn = false;

      icon.removeClass("hidden");
      loading.removeClass("visible");

      return alert("You are not connected to any social networks!");
    }

    navigator.geolocation.getCurrentPosition(function (location) {
      if (!location) return;

      if (facebookLoggedIn) {
        jobs.push(function (cb) {
          self._checkInOnFacebook(location.coords, cb);
        });
      }

      if (twitterLoggedIn) {
        jobs.push(function (cb) {
          self._checkInOnTwitter(location.coords, cb);
        });
      }

      async.parallel(jobs, function (err) {
        if (err) throw err;

        self._checkingIn = false;

        icon.removeClass("hidden");
        loading.removeClass("visible");
        mediator.publish("customer:update");
      });
    });
  };

  /**
   * Checks in on Facebook
   * @param  {Object} coords
   * @param  {Function} callback
   * @private
   */
  SidebarView.prototype._checkInOnFacebook = function(coords, callback) {
    var url = config.RESTURL + "facebook/checkIn";
    var self = this;
    var facebookAuth = this.model.get("customer").get("facebook");

    $.ajax(url, {
      crossDomain: true,
      xhrFields: {
        withCredentials: true
      },
      data: {
        token: facebookAuth.token,
        latitude: coords.latitude,
        longitude: coords.longitude
      },
      type: "POST",
      complete: function () {
        callback(null);
      },
      error:  function (xhr, status, error) {
        throw error;
      }
    });
  };

  /**
   * Checks in on Twitter
   * @param  {Object} coords
   * @param  {Function} callback
   * @private
   */
  SidebarView.prototype._checkInOnTwitter = function(coords, callback) {
    var url = config.RESTURL + "twitter/checkIn";
    var self = this;
    var twitterAuth = this.model.get("customer").get("twitter");

    $.ajax(url, {
      crossDomain: true,
      xhrFields: {
        withCredentials: true
      },
      data: {
        token: twitterAuth.token,
        secret: twitterAuth.secret,
        latitude: coords.latitude,
        longitude: coords.longitude
      },
      type: "POST",
      complete: function () {
        callback(null);
      },
      error:  function (xhr, status, error) {
        throw error;
      }
    });
  };

  /**
   * Gets called when some component wants the customer to be
   * updated
   * @private
   */
  SidebarView.prototype._onCustomerUpdate = function() {
    var self = this;
    var customer = this.model.get("customer");

    customer
      .fetch()
      .then(function () {
        self.render();
      });
  };

  /**
   * Expose SidebarView
   */
  module.exports = SidebarView;
});
