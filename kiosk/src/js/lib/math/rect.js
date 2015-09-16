define(function (require, exports, module) {
  /**
   * Rect
   * A rectangle.
   */
  function Rect(x, y, width, height) {
    if (arguments.length === 4) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
    } else {
      this.x = 0;
      this.y = 0;
      this.width = 0;
      this.height = 0;
    }
  }

  /**
   * Does the rectangle intersect with the given vector?
   * @param  {Leap.Vector} vector
   * @return {Boolean}
   */
  Rect.prototype.intersectsWithVector = function(vector) {
    return (this.x <= vector.x &&
      this.x + this.width >= vector.x &&
      this.y <= vector.y &&
      this.y + this.height >= vector.y);
  };

  /**
   * Returns a string representation
   * @return {String}
   */
  Rect.prototype.toString = function() {
    return "[Rect x: " + this.x + ", y: " + this.y + ", width: " + this.width + ", height: " + this.height + "]";
  };

  /**
   * Expose `Rect`
   */
  module.exports = Rect;
});
