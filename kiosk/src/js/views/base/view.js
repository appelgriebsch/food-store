"use strict";
define(function (require, exports, module) {
  /**
   * Module dependencies
   */
  var Chaplin = require("chaplin");
  var _ = require("underscore");
  var Handlebars = require("handlebars");
  var ViewHelpers = require("lib/view-helpers");

  /**
   * BaseView definition
   */
  var BaseView = Chaplin.View.extend({});
  _.extend(BaseView.prototype, require("lib/resize-text-to-fit-mixin"));

  /**
   * Gets the template function from Handlebars
   * @return {Function}
   * @private
   */
  BaseView.prototype.getTemplateFunction = function () {
    var template = this.template;
    var templateFunction;

    if (typeof template === "string") {
      templateFunction = Handlebars.compile(template);
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

    return templateData;
  };

  /**
   * Expose `BaseView`
   */
  module.exports = BaseView;
});
