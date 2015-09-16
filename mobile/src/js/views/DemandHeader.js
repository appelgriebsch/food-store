define(['backbone', 'templates/handlebars', 'layoutmanager'],
    function (Backbone) {

        'use strict';

        var DemandHeader = Backbone.Layout.extend({

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

            createNewEntry: function (e) {

                if (e.keyCode != 13) return;

                var entry = e.target.value;

                if (this.application.activeList) {

                    e.target.value = "";
                    this.application.activeList.addDemand(entry);
                }
            },

            events: {

                "keypress #newItem": "createNewEntry",
                "click [data-role=scan]": "scanCode",
                "click [data-role=qrcode]": "generateQRCode"
            },

            scanCode: function (e) {

                e.preventDefault();
                this.application.controller.scanQRCode();
            },

            generateQRCode: function (e) {

                e.preventDefault();
                this.application.controller.renderQRCode();
            },

            tagName: 'div',

            className: 'uk-panel-header',

            template: 'DemandHeader'

        });

        return DemandHeader;
    });

