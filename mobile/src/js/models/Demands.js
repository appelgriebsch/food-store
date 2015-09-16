define(['backbone', 'underscore', 'models/Demand', '../config', 'backbone.localStorage'],
    function (Backbone, _, Demand, config) {

        'use strict';

        var Demands = Backbone.Collection.extend({

            model: Demand,
            localStorage: new Backbone.LocalStorage("Demands"),
            url: function () {

                return config.serverUrl + '/shoppinglists/' + $.cookie('easy_dinner.loggedInUser') + '/' +
                        this.belongsTo.get('name');
            },

            parse: function (response) {

                return response.data || [];
            }
        });

        return Demands;
    });
