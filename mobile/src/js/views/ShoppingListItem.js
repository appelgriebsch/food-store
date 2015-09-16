define(['backbone', 'templates/handlebars', 'layoutmanager'],
    function (Backbone) {

        'use strict';

        var ShoppingList = Backbone.Layout.extend({

            initialize: function (params) {

                this.application = params.application;
            },

            tagName: 'li',

            template: 'ShoppingListItem',

            serialize: function () {

                var list = this.model.toJSON();
                list.itemCount = list.demands.length;
                return list;
            }
        });

        return ShoppingList;
    });
