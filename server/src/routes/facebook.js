var utils = require('../lib/utils');
var util = require('util');
var fbagent = require('fbagent');
var qs = require('querystring');
var config = require('../lib/configs').facebook;
var proxy = require('../lib/configs').proxy;
var app = require('../lib/configs').app;

exports.login = function (req, res) {

    "use strict";

    var callbackUrl = app.callbackUrl + req.path + '/callback';

    console.log("----DEBUG----");
    console.log(config);
    console.log(proxy);
    console.log(callbackUrl);

    var permissions = ['email', 'user_about_me', 'user_birthday', 'user_location', 'publish_stream', 'read_stream', 'friends_location', 'read_friendlists'];
    utils.sendJSONResponse(req, res, { result: 'success', loginUrl: fbagent.authUrl(config.appID, callbackUrl, permissions) });
};

exports.loginCallback = function (req, res) {

    "use strict";

    var code = req.query.code;
    var callbackUrl = req.protocol + '://' + req.host + ":" + app.port + req.path;

    console.log("----DEBUG----");
    console.log(config);
    console.log(proxy);
    console.log(callbackUrl);

    if (code) {

        var agent = fbagent.get('/oauth/access_token');

        if (proxy) {
            agent = agent.proxy(proxy);
        }

        agent.query({
            client_id: config.appID,
            client_secret: config.appSecret,
            code: code,
            redirect_uri: callbackUrl
        })
            .end(function (err, response) {

                if (err) {
                    console.log(err);
                    utils.sendJSONResponse(req, res, { result: 'failure', description: util.inspect(err) });
                }
                else {

                    var agent2 = fbagent.get('/oauth/access_token')

                    if (proxy) {
                        agent2 = agent2.proxy(proxy);
                    }

                    agent2.query({
                        grant_type: "fb_exchange_token",
                        client_id: config.appID,
                        client_secret: config.appSecret,
                        fb_exchange_token: response.access_token
                    })
                        .end(function (err2, response2) {

                            if (err2) {
                                console.log(err2);
                                utils.sendJSONResponse(req, res, { result: 'failure', description: util.inspect(err2) });
                            }
                            else {
                                var now = new Date();
                                var expiryDate = new Date(now.getTime() + parseInt(response2.expires));

                                res.cookie(app.name + '.facebook:token', response2.access_token);
                                res.cookie(app.name + '.facebook:expires', expiryDate.getTime());
                                res.send(utils.generateWindowCloseScript());
                            }
                        });
                }
            });
    }
};

exports.verify = function (req, res) {

    "use strict";

    var token = req.body.token;

    console.log("----DEBUG----");
    console.log(config);
    console.log(proxy);

    var agent = fbagent.get('/me');

    if (proxy) {
        agent = agent.proxy(proxy);
    }

    agent.token(token)
        .end(function (err, response) {

            if (err) {
                console.log(err);
                utils.sendJSONResponse(req, res, { result: 'failure', description: util.inspect(err) });
            }
            else {

                var agent2 = fbagent.fql('SELECT friend_count FROM user WHERE uid = me()');

                if (proxy) {
                    agent2 = agent2.proxy(proxy);
                }

                agent2.token(token)
                    .end(function(err2, response2) {

                        if (err2) {
                            console.log(err2);
                            utils.sendJSONResponse(req, res, { result: 'failure', description: util.inspect(err2) });
                        }
                        else {
                            var friends_count = response2.data[0].friend_count;
                            response.friends_count = friends_count;
                            utils.sendJSONResponse(req, res, { result: 'success', data: response });
                        }
                    });
            }
        });

};

exports.post = function (req, res) {

    "use strict";

    var token = req.body.token;
    var friendlist = req.body.friendlist || '';
    var message = req.body.message;

    console.log("----DEBUG----");
    console.log(config);
    console.log(proxy);

    var agent = fbagent.post('/me/feed');

    if (proxy) {
        agent = agent.proxy(proxy);
    }

    if (friendlist) {

        agent = agent.send("privacy={ 'value': 'CUSTOM', 'allow': '" + friendlist + "' }");
    }

    agent.token(token)
        .send("message=" + message)
        .end(function (err, response) {

            if (err) {
                console.log(err);
                utils.sendJSONResponse(req, res, { result: 'failure', description: util.inspect(err) });
            }
            else {
                console.log(response);

                var agent2 = fbagent.fql('SELECT friend_count FROM user WHERE uid = me()');

                if (proxy) {
                    agent2 = agent2.proxy(proxy);
                }

                agent2.token(token)
                    .end(function(err2, response2) {

                        if (err2) {
                            console.log(err2);
                            utils.sendJSONResponse(req, res, { result: 'failure', description: util.inspect(err2) });
                        }
                        else {
                            var friends_count = response2.data[0].friend_count;
			    response.numberOfPointsEarned = config.pointsPerFriend * friends_count;
			    
			    var user = req.session.username || req.cookies['easy_dinner.loggedInUser'];
			    utils.addCoinsToCustomer(response.numberOfPointsEarned, user, function() {
				    utils.sendJSONResponse(req, res, { result: 'success', data: response });
			    });
                        }
                    });
            }
        });
};

exports.friendlists = function (req, res) {

    "use strict";

    var token = req.query.token;

    console.log("----DEBUG----");
    console.log(config);
    console.log(proxy);

    var agent = fbagent.get('/me/friendlists');

    if (proxy) {
        agent = agent.proxy(proxy);
    }

    agent.token(token)
        .end(function (err, response) {

            if (err) {
                console.log(err);
                utils.sendJSONResponse(req, res, { result: 'failure', description: util.inspect(err) });
            }
            else {
                utils.sendJSONResponse(req, res, { result: 'success', data: response.data });
            }
        });
};

exports.checkIn = function (req, res) {

    "use strict";

    var token = req.body.token;
    var longitude = req.body.longitude;
    var latitude = req.body.latitude;

    console.log("----DEBUG----");
    console.log(config);
    console.log(proxy);

    console.log(latitude);
    console.log(longitude);

    var query = "select page_id, name, latitude, longitude from place where distance(latitude, longitude, '" +
        latitude + "', '" + longitude + "') < 50";

    var agent = fbagent.fql(query);

    if (proxy) {
        agent = agent.proxy(proxy);
    }

    agent.token(token)
        .end(function (err, response) {

            if (err) {
                console.log(err);
                utils.sendJSONResponse(req, res, { result: 'failure', description: util.inspect(err) });
            }
            else {

                var location = response.data[0];
                var agent2 = fbagent.post('/me/checkins');

                if (proxy) {

                    agent2 = agent2.proxy(proxy);
                }

                var coordinates = {

                    latitude: latitude,
                    longitude: longitude
                };

                agent2.token(token)
                    .send("message=Just checked in to " + location.name + ' #easy_dinner #WincorWorld')
                    .send("place=" + location.page_id)
                    .send("coordinates=" + JSON.stringify(coordinates))
                    .end(function (err2, response2) {

                        if (err2) {
                            console.log(err2);
                            utils.sendJSONResponse(req, res, { result: 'failure', description: util.inspect(err2) });
                        } else {
                            var agent3 = fbagent.fql('SELECT friend_count FROM user WHERE uid = me()');

                            if (proxy) {
                                agent3 = agent3.proxy(proxy);
                            }

                            agent3.token(token)
                                .end(function(err3, response3) {

                                    if (err3) {
                                        console.log(err3);
                                        utils.sendJSONResponse(req, res, { result: 'failure', description: util.inspect(err3) });
                                    }
                                    else {
                                        var friends_count = response3.data[0].friend_count;
				        var user = req.session.username || req.cookies['easy_dinner.loggedInUser'];
                                        
					response2.numberOfPointsEarned = config.pointsPerFriend * friends_count;
                                        response2.location = location;
			    
					utils.addCoinsToCustomer(response2.numberOfPointsEarned, user, function() {
						utils.sendJSONResponse(req, res, { result: 'success', data: response2 });
					});
                                    }
                                });
                        }
                    });
            }
        });
};
