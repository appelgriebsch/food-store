'use strict';
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var config = require('./lib/configs').app;
var utils = require ('./lib/utils');
var cors = require('cors');
var RedisStore = require('connect-redis')(express);

var tools = require('./routes/tools');
var recipe = require('./routes/recipe');
var shoppinglist = require('./routes/shoppinglist');
var itemlist = require('./routes/itemlist');
var customer = require('./routes/customer');

var twitter = require('./routes/twitter');
var facebook = require('./routes/facebook');

var app = express();

// all environments
app.configure(function() {
    app.set('port', config.port);
    app.use(express.favicon());
    app.use(express.compress());
    app.use(express.logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.methodOverride());
    app.use(express.cookieParser(config.cookieSecret));

    var sessionStore = (config.useRedisSession ?
                        new RedisStore() : new express.session.MemoryStore());
    app.use(express.session({
        key: config.name + '.sId',
        secret: config.cookieSecret,
        store: sessionStore
    }));
    app.use(cors({
        origin: true,
        methods: 'GET,PUT,POST,DELETE,OPTIONS',
        headers: 'Content-Type,Authorization',
        credentials: true
    }));
    app.use(app.router);
    app.use('/images', express.static(path.join(__dirname, 'images')));

    // development only
    if ('development' == app.get('env')) {
      app.use(express.errorHandler());
    }
});

app.get('/init', tools.init);

app.get('/recipes', recipe.list);
app.get('/recipes/:recipeName', recipe.single);
app.get('/recipes/byId/:recipeId', recipe.byId);

app.get('/shoppinglists', shoppinglist.list);
app.get('/shoppinglists/:username', shoppinglist.list);
app.get('/shoppinglists/:username/:shoppinglistName', shoppinglist.single);
app.get('/shoppinglists/:username/:shoppinglistName/demands', shoppinglist.getDemands);
app.get('/shoppinglists/:username/:shoppinglistName/demands/:demandID', shoppinglist.getDemand);
app.post('/shoppinglists/:username/:shoppinglistName', shoppinglist.post);
app.post('/shoppinglists/:username/:shoppinglistName/demands', shoppinglist.postDemand);
app.put('/shoppinglists/:username/:shoppinglistName', shoppinglist.put);
app.put('/shoppinglists/:username/:shoppinglistName/demands/:demandID', shoppinglist.putDemand);
app.del('/shoppinglists/:username/:shoppinglistName', shoppinglist.del);
app.del('/shoppinglists/:username/:shoppinglistName/demands/:demandID', shoppinglist.delDemand);

app.get('/itemlist/:username/:shoppinglistName', itemlist.single);

app.get('/customers', customer.list);
app.get('/customers/:username', customer.single);
app.post('/customers/:username/login', customer.login);
app.post('/customers/:username/logout', customer.logout);
app.post('/customers/:username', customer.post);
app.put('/customers/:username', customer.put);
app.del('/customers/:username', customer.del);
app.post('/customers/:username/addcoins', customer.addCoins);

app.get('/twitter/authorize', twitter.authorize);
app.get('/twitter/authorize/callback', twitter.authorizeCallback);
app.get('/twitter/channels', twitter.channels);
app.post('/twitter/verify', twitter.verify);
app.post('/twitter/post', twitter.tweet);
app.post('/twitter/checkIn', twitter.checkIn);

app.get('/facebook/login', facebook.login);
app.get('/facebook/login/callback', facebook.loginCallback);
app.get('/facebook/friendLists', facebook.friendlists);
app.post('/facebook/verify', facebook.verify);
app.post('/facebook/post', facebook.post);
app.post('/facebook/checkIn', facebook.checkIn);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
