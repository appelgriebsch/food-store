define(['underscore', 'backbone', 'views/Shell', 'router/Router', 'config', 'models/Customer', 'models/ShoppingLists', 'async'],
       function(_, Backbone, Shell, Router, Config, Customer, ShoppingLists, async) {

    'use strict';

    function Application(applicationName) {
        
        var theApp = window[applicationName] = window[applicationName] || {
        
            name: applicationName,

            start: function() {

                var self = this;

                self.shell = new Shell({ application: this });
                self.config = Config;

                async.waterfall([

                    function(callback) {

                        var userCookie = $.cookie('easy_dinner.loggedInUser');

                        if (userCookie) {

                            var self = this;

                            var user = new Customer({ _id: 'customers/' + userCookie, user_name: userCookie });

                            user.fetch({

                                success: function (data, result) {

                                    if (!result.result) return;             // ugly code: wait for the server response to decide (event will be triggered twice: one for localStorage, one for remote)

                                    if (!user.localStorage.find(data))
                                        user.localStorage.create(user);

                                    if (result.result != 'success') {
                                        callback(result.description, null);
                                    }
                                    else {
                                        callback(null, user);
                                    }
                                }
                            });
                        }
                        else {

                            callback(null, null);
                        }

                },

                function(user, callback) {

                    self.loggedOnUser = user;
                    
                    var shoppingLists = new ShoppingLists();

                    shoppingLists.fetch({

                        success: function (coll, resp) {

                            callback(null, resp.data);
                        },
                        error: function(error) {
                            
                            callback(error, null);
                        }
                    });
                }

                ], function(err, result) {

                    if (err) {
                        console.log(err);
                        self.shell.showNotification(err, "danger");
                    } 
                    else {
                        self.shoppingLists = new ShoppingLists(result);
                        self.shoppingLists.forEach(function (list) {

                            if (!self.shoppingLists.localStorage.find(list))
                                self.shoppingLists.localStorage.create(list);
                        });

                        self.controller = new Router({ application: self });
                        try {
                            Backbone.history.start();
                        }
                        catch(e) {
                        
                        }
                        self.controller.navigateTo(self.controller, '', 1000);
                    }
                });
            }
        };

        return _.extend(theApp, Backbone.Events);
    }

    return Application;
});
