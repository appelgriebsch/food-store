define(['backbone', 'models/ShoppingLists', 'models/Customer', 'models/ShoppingList',
    'views/ShoppingListsPanel', 'views/DemandsPanel', 'views/SettingsPanel', 'views/LoginPanel',
    'views/EditShoppingListPanel', 'views/QRCodePanel', 'views/ScanQRCodePanel', '../utils', 'backbone.localStorage', 'uikit', 'uikit.notify'],
    function (Backbone, ShoppingLists, Customer, ShoppingList, ShoppingListsPanel, DemandsPanel, SettingsPanel, LoginPanel, EditShoppingListPanel, QRCodePanel, ScanQRCodePanel, Utils) {

        'use strict';

        Backbone.sync = function Sync() {

            // TODO: check for online connection before syncing w/ server
            Backbone.ajaxSync.apply(this, arguments);
            return Backbone.localSync.apply(this, arguments);
        };

        // Adjust id attribute to the one CouchDB uses
        Backbone.Model.prototype.idAttribute = '_id';

        var AppRouter = Backbone.Router.extend({

            routes: {

                "": "checkDefaultRoute",
                "shoppingList/view(/:name)": "viewShoppingList",
                "shoppingList/create": "createShoppingList",
                "shoppingList/delete/:name": "deleteShoppingList",
                "settings": "showSettingsPanel",
                "login": "showLoginPanel",
                "register": "showSettingsPanel",
                "logout": "logoutUser"
            },

            checkDefaultRoute: function () {

                if (this.application.loggedOnUser) {

                    if (this.application.shoppingLists && this.application.shoppingLists.length > 0) {
                       
                        var firstList = this.application.shoppingLists.at(0);
                        this.navigateTo(this, "shoppingList/view/" + firstList.get('name'), 1000);
                    }
                    else {

                        this.navigateTo(this, "shoppingList/create", 1000);
                    }

                    this.application.shell.showNotification("Welcome back " + this.application.loggedOnUser.get('name'), 'info');
                }
                else {
                   
                    this.navigateTo(this, "login", 1000);
                }
            },

            initialize: function (params) {

                this.application = params.application;
            },

            viewShoppingList: function (name) {

                this.application.shell.registerView({

                    el: '#sidebar',
                    class: ShoppingListsPanel,
                    model: this.application.shoppingLists
                });

                if (name) {

                   var shoppingList = this.application.shoppingLists.findByName(name);

                    this.application.activeList = shoppingList;

                    this.application.shell.registerView({

                        el: "#content",
                        class: DemandsPanel,
                        model: shoppingList
                    });

                    this.application.shell.closeSidebar();
                    this.application.shell.renderLayout();
                }
                else {

                    this.application.shell.closeSidebar();
                    this.application.shell.renderLayout();
                }
            },

            showLoginPanel: function () {

                this.application.shell.registerView({

                    el: '#content',
                    class: LoginPanel,
                    model: null
                });

                this.application.shell.closeSidebar();
                this.application.shell.renderLayout();
            },

            showSettingsPanel: function () {

                this.application.shell.registerView({

                    el: '#content',
                    class: SettingsPanel,
                    model: this.application.loggedOnUser || new Customer()
                });

                this.application.shell.closeSidebar();
                this.application.shell.renderLayout();
            },

            createShoppingList: function () {

                this.application.shell.registerView({

                    el: '#sidebar',
                    class: ShoppingListsPanel,
                    model: this.application.shoppingLists
                });

                this.application.shell.registerView({

                    el: '#content',
                    class: EditShoppingListPanel,
                    model: new ShoppingList({ user: $.cookie('easy_dinner.loggedInUser') })
                });

                this.application.shell.closeSidebar();
                this.application.shell.renderLayout();
            },

            logoutUser: function () {

                var self = this;

                $.ajax({
                    type: 'POST',
                    url: this.application.config.serverUrl + '/customers/' + this.application.loggedOnUser.get('user_name') + '/logout',
                    crossDomain: true,
                    dataType: "json",
                    xhrFields: {
                        withCredentials: true
                    },
                    success: function (result) {

                        var cookies = $.cookie();

                        for (var c in cookies) {

                            $.removeCookie(c, { path: '/' });
                        }

                        localStorage.clear();
                        self.application.shell.showNotification(result.user_name + " has been logged out successfully!", 'success');
                        self.application.loggedOnUser = null;
                        self.navigateTo(self, '', 1000);
                    },
                    error: function (error) {
                        console.log(error);
                        self.application.shell.showNotification(error, 'danger');
                        self.navigateTo(self, '', 1000);
                    }
                });
            },

            saveShoppingList: function (shoppingList) {

                var self = this;

                if (shoppingList) {

                    this.application.shoppingLists.add(shoppingList);
                    shoppingList.save({}, {

                        success: function (result) {

                            var tempId = shoppingList.get('_id');
                            localStorage.removeItem('ShoppingLists-' + tempId);

                            shoppingList.set('_id', Utils.generateSlug(self.application.loggedOnUser.get('user_name') + '-' + shoppingList.get('name')));
                            self.application.shoppingLists.localStorage.update(shoppingList);

                            self.application.shell.showNotification(shoppingList.get('name') + " has been successfully created!", 'success');
                            self.navigateTo(self, "shoppingList/view/" + shoppingList.get('name'), 1000);
                        },
                        error: function (error) {
                            console.log(error);
                            self.application.shell.showNotification(error, 'danger');
                        }
                    });
                }
            },

            deleteShoppingList: function (ShoppingList) {

                var theList = this.application.shoppingLists.findByName(ShoppingList);

                var self = this;

                if (theList) {

		    var answer = confirm("Do you really want to delete " + theList.get('name') + "?");
		    
	            if (answer) {
			    theList.destroy({
				success: function (result) {
				    self.application.shell.showNotification(ShoppingList + "has been deleted successfully!", 'success');
				    self.navigateTo(self, '', 1000);
				},
				error: function (error) {
				    console.log(error);
				    self.application.shell.showNotification(error, 'danger');
				    self.navigateTo(self, '', 1000);
				}
			    });
		    }
		    else {
			self.navigateTo(self, 'shoppingList/view' + theList.get('name'), 1000);
		    }
                }
            },

            renderQRCode: function () {

                var model = {

                    userName: this.application.loggedOnUser.get('user_name'),
                    shoppingList: this.application.activeList.get('name'),
                    color: this.application.activeList.get('color')
                };

                this.application.shell.registerView({

                    el: '#content',
                    class: QRCodePanel,
                    model: model
                });

                this.application.shell.closeSidebar();
                this.application.shell.renderLayout();
            },

            scanQRCode: function () {

                var model = {

                    userName: this.application.loggedOnUser.get('user_name'),
                    shoppingList: this.application.activeList.get('name'),
                    color: this.application.activeList.get('color')
                };

                this.application.shell.registerView({

                    el: '#content',
                    class: ScanQRCodePanel,
                    model: model
                });

                this.application.shell.closeSidebar();
                this.application.shell.renderLayout();
            },

            navigateTo: function (self, route, waitTimer) {

                if (waitTimer) {
                    setTimeout(function () {
                        self.navigate(route, { trigger: true, replace: false });
                    }, waitTimer);
                }
                else {
                    self.navigate(route, { trigger: true, replace: false });
                }
            }
        });

        return AppRouter;
    });
