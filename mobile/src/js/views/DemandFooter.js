define(['backbone', 'templates/handlebars', 'layoutmanager'],
    function (Backbone) {

        'use strict';

        var DemandFooter = Backbone.Layout.extend({

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

            tagName: 'div',

            template: 'DemandFooter'

        });

        return DemandFooter;
    });
