define(['backbone', 'underscore', 'models/Demands', 'models/Demand', '../config', '../utils', 'backbone-relational'],
       function(Backbone, _, Demands, Demand, config, Utils) {

           'use strict';

           var ShoppingList = Backbone.RelationalModel.extend({
               
                defaults: {

                    'name': '',
                    'color': '#FFFFFF',
                    'user': '',
                    'type': 'ShoppingList'
                },
                relations: [{

                    type: Backbone.HasMany,
                    key: 'demands',
                    relatedModel: Demand,
                    collectionType: Demands,
                    autoFetch: true,
                    reverseRelation: {
                        key: 'belongsTo',
                        includeInJSON: false
                    }
                }],

               url: function() {

                   return config.serverUrl + '/shoppinglists/' + $.cookie('easy_dinner.loggedInUser') + '/' + this.get('name');
               },

              addDemand: function(demand) {

                   var newDemand = demand;

                   if ('string' == typeof demand) {

                       newDemand = this.parseDemandText(demand);
                   }

                   newDemand.set('id', Utils.createUUID());

                   var list = this.get('demands');

                   if (!list)
                       this.set({ 'demands': newDemand });
                   else
                       list.push(newDemand);

                   this.save();
               },

               parseDemandText: function(demandText) {

                   var info = demandText.split(" ");
                   var next = info[0];

                   var qty = 1; 
                   if (!isNaN(next)) {
                       qty = parseInt(next);
                       next = info[1];
                   }

                   var unit = '';

                   if (config.knownUnits.indexOf(next.toLowerCase()) > -1) {

                       unit = next.toLowerCase();
                       next = info[2];
                   }

                   var pos = info.indexOf(next);
                   var description = _.rest(info, pos).join(" ") ;
                   var tags = [description];
                   tags = _.union(tags, _.rest(info, pos));
                   return new Demand({ quantity: qty, unit: unit, description: description, tags: tags });
               }
           });

           ShoppingList.prototype.idAttribute = "_id";

           return ShoppingList;
       });
