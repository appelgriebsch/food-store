"use strict";
define(function (require, exports, module) {
  var _ = require("underscore");

  module.exports = {
    /**
     * Resizes the text in a hidden div until it fits
     * the width of the given object
     * @param  {jQuery} $obj
     * @private
     */
    _resizeTextToFit: function ($obj, options) {
      if (!options) {
        options = {};
      }

      options = _.defaults(options, {
        resizeStep: 2,
        minFontSize: 10
      });

      // Create a text dummy and copy the styles from
      // our original jquery object
      var dummyStyles = {
          fontSize: parseInt($obj.css("font-size")),
          fontFamily: $obj.css("font-family"),
          fontWeight: $obj.css("font-weight"),
          fontStyle: $obj.css("font-style")
        };
      var textDummy = $("<span>").css(dummyStyles);

      // Add the dummy to our document and hide it somewhere
      // far far away
      textDummy
        .css({
          position: "absolute",
          top: -9999,
          left: -9999
        })
        .appendTo("body")
        .text($obj.text());

      // Size boundaries
      var maxDummyWidth = $obj.width();

      // Scale the text down until it fits into
      // the original object's width
      for (
        var size = dummyStyles.fontSize;
        size >= options.minFontSize;
        size -= options.resizeStep
      ) {
        textDummy.css({ fontSize: size });

        if (textDummy.width() <= maxDummyWidth) {
          break;
        }
      }

      $obj.css({ fontSize: size });

      textDummy.remove();
    }
  };
});
