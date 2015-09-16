define(['backbone', 'underscore', '../config', 'backbone.localStorage'],
    function(Backbone, _, config) {

        'use strict';

        var Customer = Backbone.Model.extend({

            defaults: {

                'user_name': '',
                'name':'',
                'twitter': {
                    
                    'token': '',
                    'secret': '',
                    'data': {}
                },
                'facebook': {
                    
                    'token': '',
                    'expires': -1,
                    'data': {}
                },
                'social_coins': 0,
                'password': ''
            },

            localStorage: new Backbone.LocalStorage("User"),

            url: function() {

                   return config.serverUrl + '/customers/' + this.get('user_name');
            },

            parse: function(response) {

                return response.data || [];
            }
        });

        return Customer;
    });
