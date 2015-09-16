define(['backbone', 'views/DemandHeader', 'views/DemandItem', 'views/DemandFooter', 'templates/handlebars', 'layoutmanager'],
    function (Backbone, DemandHeaderView, DemandItemView, DemandFooterView) {

        'use strict';

        var DemandsPanel = Backbone.Layout.extend({

            initialize: function (params) {

                this.application = params.application;

                if (this.model) {
                    this.model.bind('add', this.render, this);
                    this.model.bind('remove', this.render, this);

                    this.model.bind('add:demands', this.addItemView, this);

                    this.model.bind('destroy', this.remove, this);

                    this.addAllItems(this);
                }
            },

            tagName: 'div',

            serialize: function () {

                if (this.model)
                    return this.model.toJSON();
                else
                    return {};
            },

            beforeRender: function () {

                this.setViews({
                    "[data-role='header']": new DemandHeaderView({ application: this.application, model: this.model }),
                    "[data-role='footer']": new DemandFooterView({ application: this.application, model: this.model })
                });
            },

            addAllItems: function (self) {

                self.model.get('demands').each(function (item) {

                    self.createDemandItemView(self, item);
                });
            },

            addItemView: function (item) {

                this.createDemandItemView(this, item);
            },

            createDemandItemView: function (self, item) {

                var itemView = new DemandItemView({ application: self.application, model: item });
                self.insertView("[data-role='listItems']", itemView);
                itemView.render();
            },

            template: 'DemandsPanel'
        });

        return DemandsPanel;
    });
