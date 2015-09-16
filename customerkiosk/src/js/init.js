"use strict";
requirejs.config({
    baseUrl: "js",
    paths: {
        backbone: "../libs/backbone/backbone",
        underscore: "../libs/underscore/underscore",
        handlebars: "../libs/handlebars/handlebars",
        uikit: "../libs/uikit/dist/js/uikit.min",
        jquery: "../libs/jquery/jquery",
        chaplin: "../libs/chaplin/chaplin",
        "requirejs-text": "../libs/requirejs-text/text",
        "backbone-relational": "../libs/backbone-relational/backbone-relational",
        async: "../libs/async/lib/async",
        ejs: "../libs/ejs/ejs",
        haml: "../libs/haml/haml",
        "jquery-overscroll": "../libs/jquery-overscroll/src/jquery.overscroll",
        "jquery.nicescroll": "../libs/jquery.nicescroll/jquery.nicescroll"
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
        handlebars: {
            exports: "Handlebars"
        }
    }
});

require(["main"]);
