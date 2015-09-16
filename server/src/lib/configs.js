
var app_cfg = {

    name: 'easy_dinner',
    cookieSecret: '$easy_DiNnEr§',
    useRedisSession: false,
    port: 3000,
    host: "localhost",
    websocketPort: 4510,
    callbackUrl: "http://localhost:3000"
};

var couch_cfg = {
    host: 'localhost',
    port: '5984',
    SSL: false,
    user: 'foodstore',
    pass: '$PASS$',
    database: 'foodstore'
};

var twitter_cfg = {

    appSecret: 'Zqi6qilEGIMZi3ecYc1RUvZYTj3QWoIxXtPgNzmk0',
    appID: 'lkB6Q1sOYXI866cprRPSCg',
    pointsPerFollower: 0.3
};

var facebook_cfg = {

    appSecret: 'e4f8d2e13d5645046c672e507e65033b',
    appID: '185792908276680',
    pointsPerFriend: 0.8
};

module.exports.app = app_cfg;
module.exports.couchdb = couch_cfg;
module.exports.twitter = twitter_cfg;
module.exports.facebook = facebook_cfg;
module.exports.proxy = process.env.HTTP_PROXY || ''; 
