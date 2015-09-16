define(['jquery', 'underscore', 'backbone', 'Application', 'jquery-cookie'], function($, _, Backbone, Application) {
   
    $(function() {

        window.jQuery = $;

        var theApp = new Application("fsmobile");
        theApp.start();
    });
});
