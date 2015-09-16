"use strict";
define(function (require, exports, module) {
  /**
   * Module dependencies
   */
  var Handlebars = require("handlebars");
  var BaseCollectionView = require("views/base/collection-view");
  var LeapViewMixin = require("views/base/leap-view-mixin");
  var RecipesItemView = require("views/recipes/recipes-item-view");
  var template = require("requirejs-text!templates/recipes/index.hbs");

  /**
   * IndexView definition
   */
  var IndexView = BaseCollectionView.extend({
    autoRender: true,

    container: "div#app-container",
    itemView: RecipesItemView,

    template: template,
    listSelector: "#recipes-list",

    attributes: {
      "data-leap-scroll-view": true
    },

    id: "recipes-index"
  }).extend(LeapViewMixin);

  /**
   * Gets called as soon as the user points
   * on a div that is a leap object
   * @param  {jQuery} $obj
   * @private
   */
  IndexView.prototype._onPointIntersection = function ($obj) {
    $obj.parent().addClass("highlighted");
  };

  /**
   * Gets called as soon as the user does no
   * longer point on a leap objet
   * @private
   */
  IndexView.prototype._onPointNonIntersection = function () {
    this._leapDomObjects.parent().removeClass("highlighted");
  };

  /**
   * Gets called as soon as pointing has ended
   * @private
   */
  IndexView.prototype._onPointEnded = function() {
    LeapViewMixin._onPointEnded.apply(this, arguments);

    this._leapDomObjects.parent().removeClass("highlighted");
  };

  /**
   * Expose `IndexView`
   */
  module.exports = IndexView;
});
