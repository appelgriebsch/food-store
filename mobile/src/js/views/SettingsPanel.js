define(['backbone', 'js-md5', 'async', 'models/Customer', 'templates/handlebars', 'layoutmanager'],
    function (Backbone, md5, async, Customer) {

        'use strict';

        var SettingsPanel = Backbone.Layout.extend({

            initialize: function (params) {

                this.application = params.application;
            },

            events: {

                "click #twitter-connect": "connectToTwitter",
                "click #twitter-verify": "verifyTwitterConnection",
                "click #facebook-connect": "connectToFacebook",
                "click #facebook-verify": "verifyFacebookConnection",

                "click [data-role=submit]": "saveSettings",
                "click [data-role=cancel]": "cancelSettings",

                "change #userMail": "checkUserGravatar"
            },

            tagName: 'form',

            className: 'uk-form uk-form-stacked',

            serialize: function () {

                var user = this.model.toJSON();
                user.isNew = this.model.isNew();

                return user;
            },

            connectToTwitter: function (e) {

                e.preventDefault();

                console.log("About to connect to Twitter");

                var self = this;

                $.ajax({

                    type: "GET",
                    url: this.application.config.serverUrl + "/twitter/authorize",
                    dataType: "jsonp",
                    success: function (result) {

                        if (result.result && result.result == 'success') {

                            var popup = window.open(result.loginUrl);
                            var closeTimer = setInterval(function () {

                                if (popup.closed) {
                                    clearInterval(closeTimer);
                                    self.verifyTwitterConnection();
                                }

                            }, 1000);
                        }
                        console.log(result);
                    }
                });
            },

            verifyTwitterConnection: function () {

                console.log("About to verify Twitter connection");

                var self = this;

                $.ajax({

                    type: "POST",
                    url: this.application.config.serverUrl + "/twitter/verify",
                    crossDomain: true,
                    data: { token: $.cookie("easy_dinner.twitter:token"), secret: $.cookie("easy_dinner.twitter:secret") },
                    dataType: "json",
                    success: function (result) {

                        if (self.model) {

                            var twitter = {

                                token: $.cookie("easy_dinner.twitter:token"),
                                secret: $.cookie("easy_dinner.twitter:secret"),
                                data: result.data
                            };

                            self.model.set('twitter', twitter);

                            if (twitter.data) {

                                $('#twitter-username').text(twitter.data.screen_name);
                                $('#twitter-connect').addClass('uk-hidden');
                                $('#twitter-verify').removeClass('uk-hidden');

                                self.hasNewTwitterConnection = true;
                            }
                        }
                    }
                });
            },

            connectToFacebook: function (e) {

                e.preventDefault();

                console.log("About to connect to Facebook");

                var self = this;

                $.ajax({

                    url: this.application.config.serverUrl + "/facebook/login",
                    dataType: "jsonp",
                    success: function (result) {

                        if (result.result && result.result == 'success') {

                            var popup = window.open(result.loginUrl);

                            var closeTimer = setInterval(function () {

                                if (popup.closed) {
                                    clearInterval(closeTimer);
                                    self.verifyFacebookConnection();
                                }
                            }, 1000);
                        }
                        console.log(result);
                    }
                });
            },

            verifyFacebookConnection: function () {

                console.log("About to verify Facebook connection");

                var self = this;

                $.ajax({

                    type: "POST",
                    url: this.application.config.serverUrl + "/facebook/verify",
                    crossDomain: true,
                    data: { token: $.cookie("easy_dinner.facebook:token") },
                    dataType: "json",
                    success: function (result) {

                        if (self.model) {

                            var facebook = {

                                token: $.cookie("easy_dinner.facebook:token"),
                                expires: new Date(parseInt($.cookie("easy_dinner.facebook:expires"))),
                                data: result.data
                            };

                            self.model.set('facebook', facebook);

                            if (facebook.data) {

                                $('#facebook-username').text(facebook.data.username);
                                $('#facebook-connect').addClass('uk-hidden');
                                $('#facebook-verify').removeClass('uk-hidden');

                                self.hasNewFacebookConnection = true;
                            }
                        }
                    }
                });
            },

            saveSettings: function (e) {

                //
                if (!this.el.checkValidity()) {

                    this.application.shell.showNotification("Please fill in all required fields!", "warning");
                    return;
                }

                if (this.model.isNew()) {

                    var password = $('#password1').val();

                    if (password !== $('#password2').val()) {

                        e.preventDefault();
                        this.application.shell.showNotification("Passwords do not match, please re-enter them!", "warning");
                        return;
                    }

                    this.model.set('password', password);
                    this.model.set('type', 'Customer');
                }

                e.preventDefault();

                var userName = $('#userName').val();
                var realName = $('#realName').val();
                var userMail = $('#userMail').val();

                this.model.set('user_name', userName);
                this.model.set('name', realName);
                this.model.set('user_mail', userMail);

                $.cookie('easy_dinner.loggedInUser', userName);

                var self = this;

                async.waterfall([

                    function(callback) {

                        var fbData = self.model.get('facebook').data;

                        if (self.application.config.sendWelcomePost && self.hasNewFacebookConnection && fbData.name) {

                            console.log("About to post welcome message to Facebook");

                            $.ajax({

                                type: "POST",
                                url: self.application.config.serverUrl + "/facebook/post",
                                crossDomain: true,
                                data: { token: $.cookie("easy_dinner.facebook:token"),
                                        message: "I'm currently checking out #easy_dinner at #WincorWorld, booth E5.23" },
                                dataType: "json",
                                success: function (result) {

                                    if (result.data) {
                                        var currentCoins = parseFloat(self.model.get('social_coins'));
                                        self.model.set('social_coins', currentCoins + result.data.numberOfPointsEarned);
                                    }

                                    callback(null); 
                                },
                                error: function (error) {
                                    callback(error);
                                }
                            });
                        }
                        else {
                            callback(null);
                        }
                    },

                    function(callback) {

                        var twData = self.model.get('twitter').data;

                        if (self.application.config.sendWelcomePost && self.hasNewTwitterConnection && twData.name) {

                            console.log("About to post welcome message to Twitter");

                            $.ajax({

                                type: "POST",
                                url: self.application.config.serverUrl + "/twitter/post",
                                crossDomain: true,
                                data: { token: $.cookie("easy_dinner.twitter:token"), secret: $.cookie("easy_dinner.twitter:secret"),
                                        message: "I'm currently checking out #easy_dinner at #WincorWorld, booth E5.23" },
                                dataType: "json",
                                success: function (result) {

                                    if (result.data) {

                                        var currentCoins = parseFloat(self.model.get('social_coins'));
                                        self.model.set('social_coins', currentCoins + result.data.numberOfPointsEarned);
                                    }

                                    callback(null);
                                },
                                error: function (error) {
                                    callback(error);
                                }
                            });
                        }
                        else {
                            callback(null);
                        }
                    },

                    function(callback) {

                        var model = self.model;
                        var type = (self.model.isNew() ? "POST" : "PUT");

                        $.ajax({

                            type: type,
                            url: model.url(),
                            crossDomain: true,
                            data: model.toJSON(),
                            dataType: "json",
                            success: function (result) {
                               
                                $.cookie('easy_dinner.loggedInUser', result.user_name);
                            
                                var user = new Customer({ _id: 'customers/' + result.user_name, user_name: result.user_name });
                                user.fetch({

                                    success: function (data, result) {

                                        if (!result.result) return;             // ugly code: wait for the server response to decide (event will be triggered twice: one for localStorage, one for remote)

                                        if (!user.localStorage.find(data))
                                            user.localStorage.create(user);

                                        if (result.result != 'success') {
                                            callback(result.description);
                                        }
                                        else {
                                            self.application.loggedOnUser = user;
                                            callback(null);
                                        }
                                    }
                                });

                                self.application.shell.showNotification(result.user_name + " has been successfully registered!", 'success');
                                setTimeout(function () {
                                   callback(null); 
                                }, 1000);
                            },
                            error: function (error) {
                                callback(error);
                            }
                        });
                    }

                ], function(err, result) {
                    
                    if (err) {
                        $.removeCookie('easy_dinner.loggedInUser', { path: '/' });
                        self.application.shell.showNotification(err);
                    }

                    self.goToRoot(self);
                });
            },

            cancelSettings: function (e) {

                e.preventDefault();
                this.goToRoot(this);
            },

            goToRoot: function (self) {

                self.application.controller.navigate('', { trigger: true, replace: false });
            },

            checkUserGravatar: function (e) {

                var userMail = $("#userMail").val();

                var model = this.model;
                var self = this;

                $.ajax({
                    type: "GET",
                    url: "http://www.gravatar.com/" + md5(userMail) + ".json",
                    dataType: "jsonp",
                    success: function (result) {

                        if (result && result.entry.length > 0) {

                            model.set('user_mail', userMail);
                            model.set('gravatar', result.entry[0]);
                            model.set('user_name', result.entry[0].preferredUsername);
                            model.set('name', result.entry[0].name.formatted);

                            $('#realName').val(model.get('name'));
                            $('#userName').val(model.get('user_name'));

                            $('#password1').focus();

                            $('#realName').attr('disabled', true);
                            $('#userName').attr('disabled', true);
                        }
                        else {
                            $('#realName').removeAttr('disabled');
                            $('#userName').removeAttr('disabled');
                        }
                    }
                });
            },

            template: 'SettingsPanel'
        });

        return SettingsPanel;
    });
