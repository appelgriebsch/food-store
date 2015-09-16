"use strict";
define(function (require, exports, module) {
  /**
   * Module dependencies
   */
  var Chaplin = require("chaplin");
  var BaseView = require("views/base/view");

  /**
   * CollectionView definition
   */
  var CollectionView = Chaplin.CollectionView.extend({
    getTemplateFunction: BaseView.prototype.getTemplateFunction,
    getTemplateData: BaseView.prototype.getTemplateData
  });

  /**
   * Expose `CollectionView`
   */
  module.exports = CollectionView;
});
