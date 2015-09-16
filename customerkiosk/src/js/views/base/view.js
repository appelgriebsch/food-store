"use strict";
define(function (require, exports, module) {
  /**
   * Module dependencies
   */
  var Chaplin = require("chaplin");
  var HAML = require("haml");

  /**
   * BaseView definition
   */
  var BaseView = Chaplin.View.extend({});

  /**
   * Gets the template function from Handlebars
   * @return {Function}
   * @private
   */
  BaseView.prototype.getTemplateFunction = function () {
    var template = this.template;
    var templateFunction;

    if (typeof template === "string") {
      templateFunction = HAML.compile(template);
      this.constructor.template = templateFunction;
    } else {
      templateFunction = template;
    }

    return templateFunction;
  };

  /**
   * Add locals to template data
   * @return {Object} template data
   * @private
   */
  BaseView.prototype.getTemplateData = function() {
    var templateData = Chaplin.View.prototype.getTemplateData.apply(this, arguments);

    if (this.locals) {
      for (var key in this.locals) {
        templateData[key] = this.locals[key];
      }
    }

    templateData.url = this._urlHelper;
    templateData.truncate = this._truncateHelper;
    templateData.isPromotional = this._isPromotionalHelper;
    templateData.formatPrice = this._formatPriceHelper;

    return templateData;
  };

  /**
   * e.g. {{url "recipes#show" id}}
   *
   * @return {String} The resolved url
   */
  BaseView.prototype._urlHelper = function() {
    var routeName = arguments[0];
    var params = [].slice.call(arguments, 1);

    return Chaplin.helpers.reverse(routeName, params);
  };

  /**
   * e.g. {{truncate myvar 10}}
   *
   * @param  {String} text
   * @param  {Number} length
   * @return {String}
   */
  BaseView.prototype._truncateHelper = function(text, length) {
    if (typeof length === "undefined") length = 20;

    if (text.length > length) {
      return text.substr(0, length) + "...";
    } else {
      return text;
    }
  };

  /**
   * e.g. formatPrice(10.9) => 10.90€
   * @param  {Number} price
   * @return {String}
   */
  BaseView.prototype._formatPriceHelper = function(price) {
    return price.toFixed(2) + "€";
  };

  /**
   * Expose `BaseView`
   */
  module.exports = BaseView;
});
