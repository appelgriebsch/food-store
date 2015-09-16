"use strict";
var ws = require("ws");

function WebsocketServer(config) {
  var self = this;

  this.config = config;
  this.server = new ws.Server({ port: config.websocketPort });
  this.server.on("connection", function () {
    self._onConnection.apply(self, arguments);
  });
}

/**
 * Gets called every time a new socket connects to the server
 * @param  {Socket} socket
 * @private
 */
WebsocketServer.prototype._onConnection = function(socket) {
  var scannerTimer = null;

  var stopScanner = function () {
    console.log("Stopping Scanner.");
    // Clear the interval
    if (scannerTimer) {
      clearInterval(scannerTimer);
      scannerTimer = null;
    }
  };
  socket.on("close", stopScanner);

  socket.on("message", function (message) {
    message = JSON.parse(message);
    if (message.evt === "startScanner") {
      console.log("Starting Scanner.");

      // Every 5 seconds, send a response
      scannerTimer = setInterval(function () {
        var data = JSON.stringify({ evt: "data", data: { u: "wincor", s: "Dinner" }});
        socket.send(data);
      }, 5000);

    } else if (message.evt === "stopScanner") {
      stopScanner();
    }
  });
};

module.exports = WebsocketServer;
