define(['backbone', 'underscore', 'models/Demand', 'qrcodejs', 'templates/handlebars', 'layoutmanager', 'jsqrcode'],
    function (Backbone, _, Demand) {

        'use strict';

        var ScanQRCodePanel = Backbone.Layout.extend({

            initialize: function (params) {

                this.application = params.application;
                this.file = null;
            },

            serialize: function () {

                return {
                    hasImage: (this.file != null)
                };
            },

            events: {

                "click [data-role=capture]": "startCapture",
                "click [data-role=use]": "decodeQRCode",
                "click [data-role=cancel]": "cancelQRCode",
                "change #imageFile": "updatePreview"
            },

            startCapture: function (e) {

                e.preventDefault();
                $("#imageFile").click();
            },

            decodeQRCode: function (e) {

                e.preventDefault();
                var canvas = document.getElementById("qr-canvas");
                var image = document.getElementById("imagePreview");

                canvas.width = image.width;
                canvas.height = image.height;

                var context = canvas.getContext("2d");
                context.drawImage(image, 0, 0, image.width, image.height);

                var self = this;

                qrcode.callback = function (result) {

                    console.log(result);

                    var data = JSON.parse(result);

                    $.ajax({

                        url: self.application.config.serverUrl + "/recipes/byId/" + data.i,
                        type: "GET",
                        crossDomain: true,
                        dataType: "json",
                        success: function (result) {

                            if (result.data) {

                                var recipe = result.data;

                                console.log(recipe);

                                _.each(recipe.ingredients, function (ingredient) {

                                    setTimeout(function () {

                                        var qty = (data.p / recipe.servedPersons) * ingredient.minQuantity;

                                        self.application.activeList.addDemand(new Demand({

                                            quantity: qty,
                                            unit: (((qty > 1) && (ingredient.unitPlural)) ? ingredient.unitPlural : ingredient.unit),
                                            description: ingredient.item,
                                            tags: ingredient.tags

                                        }));
                                    }, 500);
                                });

                                self.application.controller.viewShoppingList(self.application.activeList.get('name'));
                            }
                        },
                        error: function (error) {

                            console.log(error);
                            self.application.shell.showNotification("QRCode could not be decoded. Bad image quality. Please try again!", "warning");
                            setTimeout(function () {
                                self.file = null;
                                self.render();
                            }, 1000);
                        }
                    });
                };

                var self = this;

                try {
                    qrcode.decode();
                }
                catch (e) {
                    self.application.shell.showNotification("QRCode could not be decoded. Bad image quality. Please try again!", "warning");
                    setTimeout(function () {
                        self.file = null;
                        self.render();
                    }, 1000);
                }
            },

            cancelQRCode: function (e) {

                e.preventDefault();

                this.application.controller.viewShoppingList(this.application.activeList.get('name'));
            },

            updatePreview: function (e) {

                this.file = e.currentTarget.files[0];

                if (this.file) {

                    var fileReader = new FileReader();
                    fileReader.onload = function (rawData) {

                        $("[data-role='use']").removeClass('uk-hidden');
                        $("[data-role='capture']").addClass('uk-hidden');

                        $("#imagePreview").attr('src', rawData.target.result).width(256);
                    }

                    fileReader.readAsDataURL(this.file);
                }
                else {

                    this.file = null;
                    $("[data-role='capture']").removeClass('uk-hidden');
                    $("[data-role='use']").addClass('uk-hidden');
                }
            },

            tagName: 'form',

            className: 'uk-form uk-form-stacked',

            template: 'ScanQRCodePanel'
        });

        return ScanQRCodePanel;
    });
