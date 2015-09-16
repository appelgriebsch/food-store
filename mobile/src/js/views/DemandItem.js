define(['backbone', 'templates/handlebars', 'layoutmanager'],
    function (Backbone) {

        'use strict';

        var Demand = Backbone.Layout.extend({

            initialize: function (params) {

                this.application = params.application;

                this.model.bind('change', this.render, this);
                this.model.bind('destroy', this.removeItem, this);
            },

            serialize: function () {

                if (this.model)
                    return this.model.toJSON();
                else
                    return {};
            },

            events: {
                "click .toggle": "toggleDone",
                "click .uk-icon-trash-o": "deleteItem",
                "click .uk-icon-plus-circle": "increaseQty",
                "click .uk-icon-minus-circle": "decreaseQty"
            },

            afterRender: function () {

                if (this.model.get('done')) {
                    this.$el.addClass("done");
                    this.$el.find('[data-role="options"]').addClass('uk-hidden');
                }
            },

            tagName: 'li',

            className: 'listItem uk-animation-slide-bottom',

            toggleDone: function (e) {

                e.preventDefault();
                this.$el.toggleClass("done");
                this.model.toggle();
            },

            increaseQty: function (e) {

                e.preventDefault();

                var qty = this.model.get('quantity');
                var increaseBy = 1;

                if ((qty / 1000) >= 1)
                    increaseBy = 100;
                else if ((qty / 100) >= 1)
                    increaseBy = 10;
                else if ((qty / 10) >= 1)
                    increaseBy = 5;

                this.model.increaseQty(increaseBy);
            },

            decreaseQty: function (e) {

                e.preventDefault();

                var qty = this.model.get('quantity');
                var decreaseBy = 1;

                if ((qty / 1000) > 1)
                    decreaseBy = 100;
                else if ((qty / 100) > 1)
                    decreaseBy = 10;
                else if ((qty / 10) > 1)
                    decreaseBy = 5;

                this.model.decreaseQty(decreaseBy);
            },

            deleteItem: function (e) {

                e.preventDefault();
                this.model.destroy();
            },

            removeItem: function () {

                this.$el.removeClass('uk-animation-slide-bottom');
                this.$el.addClass('uk-animation-fade uk-animation-reverse');

                var self = this;

                setTimeout(function () {
                    self.remove();
                }, 1000);
            },

            template: 'DemandItem'
        });

        return Demand;
    });
