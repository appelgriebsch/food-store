"use strict";

define(function (require, exports, module) {
  var Chaplin = require("chaplin");
  var mediator = Chaplin.mediator;

  function Scanner(url) {
    var self = this;
    this._url = url;

    this._socket = null;
    this._startOnConnect = false;
    this._connected = false;

    mediator.subscribe("scanner:start", function () {
      self._onStart();
    });
    mediator.subscribe("scanner:stop", function () {
      self._onStop();
    });
    mediator.subscribe("scanner:restart", function () {
      self._onRestart();
    });

    this._connect();
  }

  /**
   * Connects to the websocket
   * @return {[type]} [description]
   */
  Scanner.prototype._connect = function() {
    var self = this;

    this._socket = new WebSocket(this._url);
    this._socket.onopen = function() {
      self._connected = true;
      if (self._startOnConnect) {
        self._onStart();
      }
    };
    this._socket.onmessage = function(message) {
      self._onMessage(message);
    };
    this._socket.onerror = function(err) {
      self._connected = false;
      throw err;
    };
    this._socket.onclose = function() {
      self._connected = false;
      this._startOnConnect = false;
    };

    // 3 seconds timeout
    setTimeout(function () {
      if (!self._connected) {
        alert("Websocket connection timeout! Reload to try again.");
      }
    }, 3000);
  };

  /**
   * Asks the scanner to send some data
   * @private
   */
  Scanner.prototype._onStart = function() {
    if (!this._connected) {
      this._startOnConnect = true;
      return;
    }

    this._send({ evt: "startScanner" });
  };

  /**
   * Asks the scanner to stop sending data
   */
  Scanner.prototype._onStop = function() {
    if (!this._connected) {
      this._startOnConnect = false;
      return;
    }

    this._send({ evt: "stopScanner" });
  };

  /**
   * Restarts the scanner
   */
  Scanner.prototype._onRestart = function() {
    this._onStop();
    this._onStart();
  };

  /**
   * Gets called when the socket has received some data
   * @param  {String} message
   * @private
   */
  Scanner.prototype._onMessage = function(message) {
    var data = JSON.parse(message.data);

    mediator.publish("scanner:data", data);
  };

  /**
   * Sends the JSON representation of the given data
   * to the websocket
   * @param  {Object} data
   * @private
   */
  Scanner.prototype._send = function(data) {
    this._socket.send(JSON.stringify(data));
  };

  module.exports = Scanner;
});
