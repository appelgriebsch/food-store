var utils = require('../lib/utils');
var util = require('util');
var twagent = require('twagent');
var qs = require('querystring');
var config = require('../lib/configs').twitter;
var proxy = require('../lib/configs').proxy;
var app = require('../lib/configs').app;

exports.authorize = function(req, res) {

    "use strict";

    var callbackUrl = app.callbackUrl + req.path + '/callback';

    console.log("----DEBUG----");
    console.log(config);
    console.log(proxy);
    console.log(callbackUrl);

    var agent = twagent.post('oauth/request_token');

    if (proxy) {
        agent = agent.proxy(proxy);
    }

    agent.consumerSecret(config.appSecret)
        .oauth('consumer_key', config.appID)
        .oauth('callback', callbackUrl)
        .end(function(resp) {
            if (resp.error) {
                console.log(resp);
                utils.sendJSONResponse(req, res, { result: 'failure', description: util.inspect(resp.error) });
            }
            else {
                var oauth_token = qs.parse(resp.text).oauth_token;
                utils.sendJSONResponse(req, res, { result: 'success', loginUrl: twagent.authUrl(oauth_token) });
            }
        });
};

exports.authorizeCallback = function(req, res) {

    "use strict";

    var oauth_token = req.query.oauth_token;
    var oauth_secret = req.query.oauth_verifier;

    console.log("----DEBUG----");
    console.log(config);
    console.log(proxy);

    var agent = twagent.post('oauth/access_token');

    if (proxy) {
        agent = agent.proxy(proxy);
    }

    agent.consumerSecret(config.appSecret)
        .oauth('consumer_key', config.appID)
        .oauth('token', oauth_token)
        .send("oauth_verifier=" + oauth_secret)
        .end(function(resp) {
            if (resp.error) {
                console.log(resp);
                utils.sendJSONResponse(req, res, { result: 'failure', description: util.inspect(resp.error) });
            }
            else {
                var data = qs.parse(resp.text);
                res.cookie(app.name + '.twitter:token', data.oauth_token);
                res.cookie(app.name + '.twitter:secret', data.oauth_token_secret);
                res.send(utils.generateWindowCloseScript());
            }
        });
};

exports.verify = function(req, res) {

    "use strict";

    var token = req.body.token;
    var secret = req.body.secret;

    console.log("----DEBUG----");
    console.log(config);
    console.log(proxy);

    var agent = twagent.get('1.1/account/verify_credentials.json');

    if (proxy) {
        agent = agent.proxy(proxy);
    }

    agent.consumerSecret(config.appSecret)
        .tokenSecret(secret)
        .oauth('token', token)
        .oauth('consumer_key', config.appID)
        .end(function (resp) {

            if (resp.error) {
                console.log(resp.error);
                utils.sendJSONResponse(req, res, { result: 'failure', description: util.inspect(resp.error) });
            }
            else {

                var data = JSON.parse(resp.text);

                var agent2 = twagent.get('1.1/users/show.json');

                if (proxy) {
                    agent2 = agent2.proxy(proxy);
                }

                agent2.consumerSecret(config.appSecret)
                    .tokenSecret(secret)
                    .query({
                        user_id: data.id,
                        screen_name: data.screen_name
                    })
                    .oauth('token', token)
                    .oauth('consumer_key', config.appID)
                    .end(function (resp2) {

                        if (resp2.error) {
                            console.log(resp2.error);
                            utils.sendJSONResponse(req, res, { result: 'failure', description: util.inspect(resp2.error) });
                        }
                        else {
                            var data2 = JSON.parse(resp2.text);
                            utils.sendJSONResponse(req, res, { result: 'success', data: data2 });
                        }
                    });
            }
        });
};

exports.tweet = function(req, res) {

    "use strict";

    console.log("----DEBUG----");
    console.log(config);
    console.log(proxy);

    var token = req.body.token;
    var secret = req.body.secret;
    var message = req.body.message;

    var agent = twagent.post('1.1/statuses/update.json');

    if (proxy) {
        agent = agent.proxy(proxy);
    }

    agent.consumerSecret(config.appSecret)
        .send({status: message})
        .tokenSecret(secret)
        .oauth('token', token)
        .oauth('consumer_key', config.appID)
        .end(function (resp) {

            if (resp.error) {
                console.log(resp.error);
                utils.sendJSONResponse(req, res, { result: 'failure', description: util.inspect(resp.error) });
            }
            else {
                var response = { id: resp.body.id_str, user: resp.body.user.screen_name, numberOfPointsEarned: config.pointsPerFollower * resp.body.user.followers_count };
	        var user = req.session.username || req.cookies['easy_dinner.loggedInUser'];

	        utils.addCoinsToCustomer(response.numberOfPointsEarned, user, function() {
		       utils.sendJSONResponse(req, res, { result: 'success', data: response });
	        });
            }
        });
};

exports.channels = function(req, res) {

    "use strict";

    var token = req.query.token;
    var secret = req.query.secret;

    console.log("----DEBUG----");
    console.log(config);
    console.log(proxy);

    var agent = twagent.get('1.1/lists/ownerships.json');

    if (proxy) {
        agent = agent.proxy(proxy);
    }

    agent.consumerSecret(config.appSecret)
        .tokenSecret(secret)
        .oauth('token', token)
        .oauth('consumer_key', config.appID)
        .end(function (resp) {

            if (resp.error) {
                console.log(resp.error);
                utils.sendJSONResponse(req, res, { result: 'failure', description: util.inspect(resp.error) });
            }
            else {
                var data = JSON.parse(resp.text);
                utils.sendJSONResponse(req, res, { result: 'success', data: data.lists });
            }
        });
};

exports.checkIn = function(req, res) {

    "use strict";

    var token = req.body.token;
    var secret = req.body.secret;

    var longitude = req.body.longitude;
    var latitude = req.body.latitude;

    console.log("----DEBUG----");
    console.log(config);
    console.log(proxy);

    console.log(latitude);
    console.log(longitude);

    var agent = twagent.get('1.1/geo/reverse_geocode.json');

    if (proxy) {
        agent = agent.proxy(proxy);
    }

    agent.consumerSecret(config.appSecret)
        .tokenSecret(secret)
        .query({
            lat: latitude,
            long: longitude,
            accuracy: 10,
            max_results: 3
        })
        .oauth('token', token)
        .oauth('consumer_key', config.appID)

        .end(function (resp) {

            if (resp.error) {
                console.log(resp.error);
                utils.sendJSONResponse(req, res, { result: 'failure', description: util.inspect(resp.error) });
            }
            else {

                var data = JSON.parse(resp.text);
                var location = data.result.places[0];

                var agent2 = twagent.post('1.1/statuses/update.json');

                if (proxy) {
                    agent2 = agent2.proxy(proxy);
                }

                agent2.consumerSecret(config.appSecret)
                    .send({ status: 'Just checked in to '  + location.full_name + ' #easy_dinner #WincorWorld',
                            lat: latitude, long: longitude, place_id: location.id })
                    .tokenSecret(secret)
                    .oauth('token', token)
                    .oauth('consumer_key', config.appID)
                    .end(function (resp2) {

                        if (resp2.error) {
                            console.log(resp2.error);
                            utils.sendJSONResponse(req, res, { result: 'failure', description: util.inspect(resp2.error) });
                        }
                        else {
                            var response = { id: resp2.body.id_str,
                                user: resp2.body.user.screen_name, numberOfPointsEarned: config.pointsPerFollower * resp2.body.user.followers_count,
                                location: location };
			    var user = req.session.username || req.cookies['easy_dinner.loggedInUser'];

			    utils.addCoinsToCustomer(response.numberOfPointsEarned, user, function() {
			         utils.sendJSONResponse(req, res, { result: 'success', data: response });
			    });
                        }
                    });
            }
        });
};

