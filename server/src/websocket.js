'use strict';

/**
 * Module dependencies.
 */
var WebsocketServer = require('./lib/websocket-server');
var config = require('./lib/configs').app;
var websocketServer = new WebsocketServer(config);
