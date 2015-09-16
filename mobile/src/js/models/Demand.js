define(['backbone', 'underscore', '../config', 'backbone-relational'],
    function(Backbone, _, config) {

        'use strict';

        var Demand = Backbone.RelationalModel.extend({

            defaults: {

                'id': null,
                'quantity': 1,
                'unit': '',
                'description': '',
                'tags': [],
                'photo': '',
                'done': false
            },

            toggle: function () {
                var done = this.isDone() ? false : true;
                this.save({ done: done });
            },

            isDone: function() {
                return this.get("done");
            },

            increaseQty: function(by) {
                var qty = this.get('quantity') || 1;
                this.save({ quantity: (qty + by)});
            },

            decreaseQty: function(by) {
                var qty = this.get('quantity') || 1;
                if ((qty - by) <= 0) {
                    this.toggle();
                }
                else {
                    this.save({ quantity: (qty - by)});
                }
            },

            url: function() {
              
                var list = this.get('belongsTo');
                var url = list.url() + '/demands';
               
                if (this.isNew()) {
                    return url;
                }
                return url + '/' + this.get('id'); 
            },

            parse: function(response) {

                return response.data || {};
            }
        });

        Demand.prototype.idAttribute = 'id';

        return Demand;
    });
