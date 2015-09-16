define(['backbone', 'templates/handlebars', 'layoutmanager'],
    function (Backbone) {

        'use strict';

        var LoginPanel = Backbone.Layout.extend({

            initialize: function (params) {

                this.application = params.application;
            },

            serialize: function () {

                if (this.model) {
                    return this.model.toJSON();
                }
                else {
                    return {};
                }
            },

            checkLogin: function () {

                if (!this.el.checkValidity()) {

                    //TODO: alert about missing inputs
                    return;
                }

                var self = this;

                $.ajax({
                    type: 'POST',
                    url: this.application.config.serverUrl + '/customers/' + $('#userName').val() + '/login',
                    crossDomain: true,
                    data: { pwd: $('#password').val() },
                    dataType: "json",
                    xhrFields: {
                        withCredentials: true
                    },
                    success: function (result) {

                        if (result.result === 'failure') {
                            self.application.shell.showNotification(result.description, 'danger');
                        }
                        else {
                            $.cookie('easy_dinner.loggedInUser', $('#userName').val(), { path: '/' });
                            self.application.start();
                        }
                    },
                    error: function (error) {
                        console.log(error);
                    }
                });
            },

            enterRegistration: function () {

                this.application.controller.navigate('register', { trigger: true, replace: false });
            },

            events: {

                "click [data-role='login']": "checkLogin",
                "click [data-role='register']": "enterRegistration"
            },

            tagName: 'form',

            className: 'uk-form uk-form-stacked',

            template: 'LoginPanel'
        });

        return LoginPanel;
    });
