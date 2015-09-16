define(['backbone', 'templates/handlebars', 'layoutmanager', 'spectrum'],
    function (Backbone) {

        'use strict';

        var EditShoppingListPanel = Backbone.Layout.extend({

            initialize: function (params) {

                this.application = params.application;
                this.on("afterRender", function (view) {
                    $('#color').spectrum({
                        showButtons: false
                    });
                });
            },

            serialize: function () {

                if (this.model) {
                    return this.model.toJSON();
                }
                else {
                    return {};
                }
            },

            events: {

                "click [data-role=submit]": "saveShoppingList",
                "click [data-role=cancel]": "cancelShoppingList"
            },

            tagName: 'form',

            className: 'uk-form uk-form-stacked',

            template: 'EditShoppingListPanel',

            saveShoppingList: function (e) {

                if (!this.el.checkValidity()) {

                    this.application.shell.showNotification("Please fill in all required fields!", "warning");
                    return;
                }

                e.preventDefault();

                this.model.set('name', $('#name').val());
                this.model.set('color', $('#color').val());

                this.application.controller.saveShoppingList(this.model);
            },

            cancelShoppingList: function (e) {

                e.preventDefault();

                this.application.controller.navigate('', { trigger: true, replace: false });
            }
        });

        return EditShoppingListPanel;
    });
