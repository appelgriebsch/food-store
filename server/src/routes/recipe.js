var utils = require('../lib/utils');
var util = require('util');

/*
 * GET list of all recipes
 */

exports.list = function (req, res) {

    'use strict';

    var db = require('./tools').cradledb();

    db.view('recipes/all', null, function (err, rows) {
        if (err) {
            utils.sendJSONResponse(req, res, { result: 'failure', description: 'error while querying database: ' + util.inspect(err) });
            console.log('error while accessing view: ' + util.inspect(err));
        } else {
            var result = [];
            if (rows) {

                rows.forEach(function (row) {

                    if (row.value) {
                        result.push(row.value);
                    }
                    else {
                        result.push(row);
                    }
                });
            }

            utils.sendJSONResponse(req, res, { result: 'success', data: result });
        }
    });
};


/*
 * GET one particular recipe
 */

exports.single = function (req, res) {

    'use strict';

    var db = require('./tools').cradledb();

    // support for using '+' as space character
    var recipeNameKey = req.params.recipeName.replace(new RegExp('\\+', 'g'), ' ');

    db.view('recipes/byName', { key: recipeNameKey }, function (err, doc) {
        if (err) {
            utils.sendJSONResponse(req, res, { result: 'failure', description: 'error while querying database: ' + util.inspect(err) });
            console.log('error while accessing view: ' + util.inspect(err));
        } else {
            if (doc.length > 0)
                utils.sendJSONResponse(req, res, { result: 'success', data: doc[0].value });
            else
                utils.sendJSONResponse(req, res, { result: 'failure', description: 'requested recipe not found: ' + recipeNameKey });
        }
    });
};

/*
 * GET one particular recipe
 */

exports.byId = function (req, res) {

    'use strict';

    var db = require('./tools').cradledb();

    // support for using '+' as space character
    var recipeNameKey = req.params.recipeId.replace(new RegExp('\\+', 'g'), ' ');

    db.view('recipes/all', { key: recipeNameKey }, function (err, doc) {
        if (err) {
            utils.sendJSONResponse(req, res, { result: 'failure', description: 'error while querying database: ' + util.inspect(err) });
            console.log('error while accessing view: ' + util.inspect(err));
        } else {
            if (doc.length > 0)
                utils.sendJSONResponse(req, res, { result: 'success', data: doc[0].value });
            else
                utils.sendJSONResponse(req, res, { result: 'failure', description: 'requested recipe not found: ' + recipeNameKey });
        }
    });
};
