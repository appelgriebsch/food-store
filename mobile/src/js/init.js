requirejs.config({
    baseUrl: "js",
    paths: {
        backbone: "../libs/backbone/backbone",
        handlebars: "../libs/handlebars/handlebars",
        jquery: "../libs/jquery/jquery",
        layoutmanager: "../libs/layoutmanager/backbone.layoutmanager",
        requirejs: "../libs/requirejs/require",
        uikit: "../libs/uikit/dist/js/uikit.min",
        "uikit.notify": "../libs/uikit/addons/src/notify/notify",
        underscore: "../libs/underscore/underscore",
        "backbone.localStorage": "../libs/backbone.localStorage/backbone.localStorage",
        "backbone-relational": "../libs/backbone-relational/backbone-relational",
        "jquery-cookie": "../libs/jquery-cookie/jquery.cookie",
        qrcodejs: "../libs/qrcodejs/qrcode",
        "js-md5": "../libs/js-md5/js/md5",
        spectrum: "../libs/spectrum/spectrum",
        jsqrcode: "../libs/jsqrcode/jsqrcode",
        async: "../libs/async/lib/async"
    },
    shim: {
        underscore: {
            exports: "_"
        },
        backbone: {
            deps: [
                "underscore"
            ],
            exports: "Backbone"
        },
        localStorage: {
            deps: [
                "backbone"
            ]
        },
        layoutManager: {
            deps: [
                "backbone"
            ]
        },
        handlebars: {
            exports: "Handlebars"
        },
        "uikit.notify": {
            exports: "uikit"
        }
    }
});

require(['main']);
