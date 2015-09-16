define(['backbone', 'underscore', 'templates/handlebars', 'layoutmanager', 'uikit', 'uikit.notify'], function (Backbone, _) {

    'use strict';

    Backbone.Layout.configure({

        // use the layout manager to render ALL kind of Backbone.Views...
        manage: true,

        // paths to templates (within public/)
        prefix: "",

        // function to lazy-load templates on demand
        fetchTemplate: function (template) {

            console.log("About to fetch template " + template);

            return Handlebars.templates[template];
        }
    });

    var Shell = Backbone.Layout.extend({

        el: "body",
        template: "Shell",

        panels: [],

        initialize: function (params) {

            this.application = params.application;

            if (navigator.mozApps) {

                var isInstalled = navigator.mozApps.getSelf();

                isInstalled.onsuccess = function () {

                    if (isInstalled.result) {

                        this.isInstalled = true;
                    }
                };
            }
        },

        events: {

            'click .install-button': 'installApp',
            'touch .install-button': 'installApp'
        },

        registerView: function (view) {

            var origView = _.find(this.panels, function (v) {
                return v.el === view.el;
            });

            if (origView) {
                this.panels = _.without(this.panels, origView);
                this.removeView(origView);
            }

            this.panels.push(view);
        },

        renderLayout: function () {

            this.render();
        },

        serialize: function () {

            return {

                applicationName: this.application.config.applicationName,
                canBeInstalled: (typeof navigator.mozApps !== 'undefined') && (!this.isInstalled),
                user: (this.application.loggedOnUser ? this.application.loggedOnUser.toJSON() : {})
            };
        },

        installApp: function () {

            if (confirm('Do you want to install the app on your device?')) {

                var manifestUrl = location.origin + "/manifest.webapp";
		console.log("Install from " + manifestUrl);
                var request = navigator.mozApps.install(manifestUrl);
                request.onsuccess = function () {

                    alert('Installation successfully!');
                    this.application.navigateToRoot();
                };
                request.onerror = function () {

                    alert('Installation failed. Error: ' + this.error.name);
                };
            }
        },

        closeSidebar: function () {

            var sidebar = this.getView('#sidebar');

            if (sidebar) {
                this.getView('#sidebar').close();
            }
        },

        showNotification: function (message, type) {

            var theMsg;
            if ((type === 'info') || (type === 'success')) {
                theMsg = "<i class='uk-icon-info-circle icon-notify'></i>" + message;
            }
            else if (type === 'warning') {
                theMsg = "<i class='uk-icon-warning icon-notify'></i>" + message;
            }
            else if (type === 'danger') {
                theMsg = "<i class='uk-icon-exclamation-triangle icon-notify'></i>" + message;
            }
            else {
                theMsg = message;
            }

            $.UIkit.notify({
                message: theMsg,
                status: type,
                timeout: 5000,
                pos: 'bottom-center'
            });
        },

        beforeRender: function () {

            var self = this;

            this.panels.forEach(function (view) {

                self.setView(view.el, new view.class({ application: self.application, model: view.model }));
            });
        }
    });

    return Shell;
});
