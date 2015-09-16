define(['backbone', 'underscore', 'models/ShoppingList', '../config', 'backbone.localStorage'],
       function(Backbone, _, ShoppingList, config) {
          
           'use strict';

           var ShoppingLists = Backbone.Collection.extend({
               
               model: ShoppingList,
               localStorage: new Backbone.LocalStorage("ShoppingLists"),
               url: function() {

                   return config.serverUrl + '/shoppinglists/' + $.cookie('easy_dinner.loggedInUser');
               },

               parse: function(response) {

                   return response.data || [];
               },

               findByName: function(fName) {
                  
                   return this.findWhere({ name: fName });
               }
           });

           return ShoppingLists;
       });
