define(['backbone', 'qrcodejs', 'templates/handlebars', 'layoutmanager'],
    function (Backbone) {

        'use strict';

        var QRCodePanel = Backbone.Layout.extend({

            initialize: function (params) {

                this.application = params.application;
            },

            serialize: function () {

                return {

                    color: this.model.color,
                    name: this.model.shoppingList
                };
            },

            afterRender: function () {

                var outputModel = {};
                outputModel.u = this.model.userName;
                outputModel.s = this.model.shoppingList;
                var qrcode = new QRCode(this.$el.find("#QRCode").get(0), {

                    text: JSON.stringify(outputModel),
                    colorDark: "#000000",
                    colorLight: "#ffffff"
                });
            },

            events: {
                
                "click [data-role=ok]": "onSubmit"
            },

            onSubmit: function(e) {
            
                e.preventDefault();
                this.application.controller.viewShoppingList(this.application.activeList.get('name')); 
            },

            tagName: 'form',

            className: 'uk-form uk-form-stacked',

            template: 'QRCodePanel'
        });

        return QRCodePanel;
    });
