define(['backbone', 'views/ShoppingListItem',
    'templates/handlebars', 'layoutmanager'],
    function (Backbone, ShoppingListItemView) {

        'use strict';

        var ShoppingListsPanel = Backbone.Layout.extend({

            initialize: function (params) {

                this.application = params.application;

                if (this.model) {
                    this.model.bind('add', this.render, this);
                    this.model.bind('change', this.render, this);
                    this.model.bind('remove', this.render, this);
                    this.model.bind('destroy', this.remove, this);
                }
            },

            className: 'uk-offcanvas-bar',

            tagName: 'div',

            serialize: function () {

                return {

                    title: 'Shopping Lists'
                };
            },

            close: function () {

                $.UIkit.offcanvas.offcanvas.hide();
            },

            beforeRender: function () {

                var self = this;

                this.model.each(function (item) {

                    var itemView = new ShoppingListItemView({ application: self.application, model: item });
                    self.insertView("[data-role='listItems']", itemView);
                });
            },

            template: 'ShoppingListsPanel'
        });

        return ShoppingListsPanel;
    });
