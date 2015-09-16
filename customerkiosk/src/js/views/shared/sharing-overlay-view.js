"use strict";
define(function (require, exports, module) {
  /**
   * Module dependencies
   */
  var Chaplin = require("chaplin");
  var BaseView = require("views/base/view");
  var template = require("requirejs-text!templates/shared/sharing-overlay.haml");
  var async = require("async");
  var config = require("config");
  var mediator = Chaplin.mediator;

  /**
   * SharingOverlayView definition
   */
  var SharingOverlayView = BaseView.extend({
    template: template,
    className: "overlay",
    listen: {
      "open-share-dialog mediator": "open"
    },
    events: {
      "submit #sharing-form": "_onFormSubmit",
      "click #sharing-cancel": "close",
      "click .sharing-button-left": "_showPreviousMessage",
      "click .sharing-button-right": "_showNextMessage",
      "click #friendlists li": "_onFriendlistClick",
      "click .sharing-bar-networks input": "_onNetworkClick"
    }
  });

  /**
   * The array of messages the user can click through
   * @type {Array}
   */
  SharingOverlayView.messages = [
    "Let's have a party together!",
    "Dinner is on Friday!",
    "I'll be cooking {{shoppinglist}} tonight! Come over!",
    "Video night at my house! I'm cooking {{shoppinglist}}!"
  ];

  /**
   * The initial message index
   * @type {Number}
   */
  SharingOverlayView.prototype.messageIndex = 0;

  /**
   * Shows the initial message after rendering the view
   * @private
   */
  SharingOverlayView.prototype.render = function() {
    BaseView.prototype.render.apply(this, arguments);

    this.loadingIndicator = this.$el.find(".loading");

    this._handleNetworkStates();
    this._showMessage();
  };

  /**
   * Enables / disables social network checkboxes depending on
   * whether the user has connected to them
   * @private
   */
  SharingOverlayView.prototype._handleNetworkStates = function() {
    var customer = this.model.get("customer");
    var wrapper;

    if (!customer.loggedIn("facebook")) {
      wrapper = this.$el.find("#network-facebook-wrapper");
      wrapper.find("input").attr("disabled", "disabled");
      wrapper.addClass("disabled");
    }

    if (!customer.loggedIn("twitter")) {
      wrapper = this.$el.find("#network-twitter-wrapper");
      wrapper.find("input").attr("disabled", "disabled");
      wrapper.addClass("disabled");
    }
  };

  /**
   * Shows the sharing overlay
   * @public
   */
  SharingOverlayView.prototype.open = function() {
    var $el = this.$el;

    $el.addClass("visible");
    setTimeout(function () {
      $el.addClass("visible-faded-in");
    }, 1);
  };

  /**
   * Closes the sharing overlay
   * @public
   */
  SharingOverlayView.prototype.close = function() {
    var $el = this.$el;

    $el.removeClass("visible-faded-in");
    setTimeout(function () {
      $el.removeClass("visible");
    }, 300);
  };

  /**
   * Shows the loading indicator
   * @private
   */
  SharingOverlayView.prototype._showLoadingIndicator = function() {
    var self = this;

    this.loadingIndicator.addClass("visible");
    setTimeout(function () {
      self.loadingIndicator.addClass("visible-faded-in");
    }, 1);
  };

  /**
   * Hides the loading indicator
   * @private
   */
  SharingOverlayView.prototype._hideLoadingIndicator = function() {
    var self = this;

    this.loadingIndicator.removeClass("visible-faded-in");
    setTimeout(function () {
      self.loadingIndicator.removeClass("visible");
    }, 1);
  };

  /**
   * Show the previous sharing message
   * @param {Event} e
   * @private
   */
  SharingOverlayView.prototype._showPreviousMessage = function(e) {
    e.preventDefault();

    this.messageIndex--;
    if (this.messageIndex < 0) {
      this.messageIndex = SharingOverlayView.messages.length - 1;
    }
    this._showMessage();
  };

  /**
   * Show the next sharing message
   * @param {Event} e
   * @private
   */
  SharingOverlayView.prototype._showNextMessage = function(e) {
    e.preventDefault();

    this.messageIndex++;
    if (this.messageIndex > SharingOverlayView.messages.length - 1) {
      this.messageIndex = 0;
    }
    this._showMessage();
  };

  /**
   * Display the currently selected message
   * @private
   */
  SharingOverlayView.prototype._showMessage = function() {
    var message = this._getMessage(this.messageIndex);
    this.$el.find("#sharing-text").text(message);
  };

  /**
   * Called whenever a friendlist has been clicked
   * @param {Event} e
   * @private
   */
  SharingOverlayView.prototype._onFriendlistClick = function(e) {
    var target = $(e.target);
    var friendlistId = target.data("id").toString();
    var friendlists = this.model.get("customer").get("friendlists");
    var friendlist = friendlists.findWhere({ id: friendlistId });

    if (friendlist.get("selected")) {
      friendlist.set("selected", false);
      target.removeClass("active");
    } else {
      friendlist.set("selected", true);
      target.addClass("active");
    }
  };

  /**
   * Called when a network checkbox has been clicked
   * @param  {Event} e
   * @private
   */
  SharingOverlayView.prototype._onNetworkClick = function(e) {
    var target = $(e.target);
    var network = target.val();
    var checked = target.is(":checked");
    var friendlists = this.$el.find("#friendlists");

    if (network === "facebook") {
      if (checked) {
        friendlists.removeClass("disabled");
      } else {
        friendlists.addClass("disabled");
      }
    }
  };

  /**
   * Called whenever the form has been submitted
   * @param  {Event} e
   * @private
   */
  SharingOverlayView.prototype._onFormSubmit = function(e) {
    var target = $(e.target);

    e.preventDefault();
    if (!this._validateForm(target)) return;

    /**
     * Share the message on FB / Twitter
     */
    var jobs = [];
    var self = this;
    var facebookChecked = target.find("#network-facebook").is(":checked");
    var twitterChecked = target.find("#network-twitter").is(":checked");

    this._showLoadingIndicator();

    if (facebookChecked) {
      jobs.push(function (cb) {
        self._shareOnFacebook(target, cb);
      });
    }

    if (twitterChecked) {
      jobs.push(function (cb) {
        self._shareOnTwitter(target, cb);
      });
    }

    /**
     * Run the jobs in parallel
     */
    async.parallel(jobs, function (err) {
      if (err) throw err;

      self.close();
      setTimeout(function () {
        self._hideLoadingIndicator();
        mediator.publish("customer:update");
      }, 400);
    });
  };

  /**
   * Validates the sharing form, returns the result
   * @param  {$} form
   * @return {Boolean}
   */
  SharingOverlayView.prototype._validateForm = function(form) {
    var networksChecked = form.find("input[name=networks]:checked").length;
    var facebookChecked = form.find("#network-facebook").is(":checked");
    var friendlistsChecked = form.find("#friendlists li.active").length;

    // Make sure the user selected a network
    if (!networksChecked) {
      alert("Please select a network you would like to share your message on.");
      return false;
    }

    // If facebook has been selected, make sure that
    // at least one friends list has been selected
    if (facebookChecked && !friendlistsChecked) {
      alert("Please select a friend list you would like to share the message with.");
      return false;
    }

    return true;
  };

  /**
   * Share the message on facebook using the given form
   * @param {$} form
   * @param {Function} callback
   * @private
   */
  SharingOverlayView.prototype._shareOnFacebook = function(form, callback) {
    var url = config.RESTURL + "facebook/post";
    var friendlistIds = this._getSelectedFriendlists().join(",");
    var message = this._getMessage(this.messageIndex);
    var self = this;

    $.ajax(url, {
      crossDomain: true,
      xhrFields: {
        withCredentials: true
      },
      data: {
        token: this.model.get("customer").get("facebook").token,
        message: message,
        friendlist: friendlistIds
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
   * Share the message on twitter using the given form
   * @param {$} form
   * @param {Function} callback
   * @private
   */
  SharingOverlayView.prototype._shareOnTwitter = function(form, callback) {
    var url = config.RESTURL + "twitter/post";
    var message = this._getMessage(this.messageIndex);
    var twitterCredentials = this.model.get("customer").get("twitter");
    var self = this;

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
        callback(null);
      },
      error: function (xhr, status, error) {
        throw error;
      }
    });
  };

  /**
   * Returns the ids of the currently selected friend lists
   * @return {Array}
   */
  SharingOverlayView.prototype._getSelectedFriendlists = function() {
    var selectedFriendlists = this.$el.find("#friendlists li.active");
    var ids = [];

    selectedFriendlists.each(function (index, el) {
      ids.push($(el).data("id"));
    });

    return ids;
  };

  /**
   * Returns the formatted message at the given index
   * @param  {Number} index
   * @return {String}
   */
  SharingOverlayView.prototype._getMessage = function(index) {
    var message = SharingOverlayView.messages[index];
    message = message.replace("{{shoppinglist}}", this.model.get("id"));
    return message;
  };

  /**
   * Expose SharingOverlayView
   */
  module.exports = SharingOverlayView;
});
