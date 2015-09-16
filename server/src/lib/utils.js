"use strict";
var Utils = {};

/**
 * Responds with JSONP in case a callback is given, otherwise
 * it just response with simple json
 * @param  {HTTP.Request} req
 * @param  {HTTP.Response} res
 * @param  {Number} statusCode
 * @param  {Object} data
 */
Utils.sendJSONResponse = function (req, res, data, statusCode) {
    var callback = req.query.callback;

    if (typeof statusCode === "undefined") {
        statusCode = 200;
    }

    res.status(statusCode);
    if (typeof callback === "undefined") {
        res.header("Content-Type", "application/json");
        return res.send(data);
    } else {
        res.header("Content-Type", "application/javascript");
        return res.send(callback + "(" + JSON.stringify(data) + ")");
    }
};

/**
 * Generates a url conform slug from the given stirng
 * @param  {String} string
 * @return {String}
 */
Utils.generateSlug = function (string) {
  return string
    .toLowerCase()
    .replace(/ /g,"-")
    .replace(/[^\w-]+/g,"");
};

Utils.generateWindowCloseScript = function() {
    return "<html><body><script type=\"application/javascript\">window.close();</script></body></html>";
};

/**
 * add social coins to one particular customer
 * @param  {Number} coins
 * @param  {String} username
 */
Utils.addCoinsToCustomer = function (coins, username, callback) {

    var db = require('../routes/tools').cradledb();
    var Customer = require('../models/customer');
    var util = require('util');

    var usernameKey = username;
    //console.log('usernameKey: ' + usernameKey);

    var existingCustomer;

    // verify that the customer already exists
    db.view('customers/byName', { key: usernameKey }, function (err, doc) {
        if (err) {
            console.log('addCoinsToCustomer: error while accessing view: ' + util.inspect(err));
            callback(err, null);
        } else {
            if (doc.length != 1) {
                console.log('addCoinsToCustomer: could not identify customer \"' + usernameKey + '\"');
                callback('addCoinsToCustomer: could not identify customer \"' + usernameKey + '\"', null);
            } else {
                existingCustomer = doc[0].value;
                verifyObject();
            }
        }
    });

    function verifyObject() {
    	//console.log('earned coins: ', coins);
        if (!coins) {
            console.log('addCoinsToCustomer: no coins supplied');
            callback('addCoinsToCustomer: no coins supplied', null);
        } else if (coins < 0) {
            console.log('addCoinsToCustomer: coins must be >= 0');
            callback('addCoinsToCustomer: coins must be >= 0', null);
        }
        updateObject();
    }
    
    function updateObject() {
    	//console.log('existingCustomer.social_coins: ' + parseInt(existingCustomer.social_coins));
    	var newSocialCoins = parseInt(existingCustomer.social_coins) + parseInt(coins);
        db.merge(existingCustomer._id, { social_coins: newSocialCoins }, function (err, saveresult) {
            if (err) {
                console.log('addCoinsToCustomer: error while updating customer: ' + err);
                callback('addCoinsToCustomer: error while updating customer: ' + err, null);
            } else {
            	existingCustomer.social_coins = parseInt(newSocialCoins);
            	callback(null, existingCustomer);
            }
        });
    }
};

module.exports = Utils;
