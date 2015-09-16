var utils = require('../lib/utils');
var util = require('util');
var bcryptjs = require('bcryptjs');

/*
 * GET list of all customers
 */

exports.list = function (req, res) {

    'use strict';

    var db = require('./tools').cradledb();

    db.view('customers/all', null, function (err, rows) {
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
 * GET one particular customer
 */

exports.single = function (req, res) {

    'use strict';

    var db = require('./tools').cradledb();

    // support for using '+' as space character
    var usernameKey = req.params.username.replace(new RegExp('\\+', 'g'), ' ');

    db.view('customers/byName', { key: usernameKey }, function (err, doc) {
        if (err) {
            utils.sendJSONResponse(req, res, { result: 'failure', description: 'error while querying database: ' + util.inspect(err) });
            console.log('error while accessing view: ' + util.inspect(err));
        } else {
            if (doc.length > 0)
                utils.sendJSONResponse(req, res, { result: 'success', data: doc[0].value });
            else
                utils.sendJSONResponse(req, res, { result: 'failure', description: 'requested customer not found: ' + usernameKey });
        }
    });
};


/*
 * POST one particular customer
 */

exports.post = function (req, res) {

    'use strict';

    var db = require('./tools').cradledb();
    var Customer = require('../models/customer');

    var customer;
    try {
        customer = req.body;
    } catch (err) {
        utils.sendJSONResponse(req, res, {
            result: 'failure',
            description: 'posted data cannot be parsed as JSON: ' + err
        });
        console.log('posted data cannot be parsed as JSON: ' + err);
        return;
    }
    
    // support for using '+' as space character
    var usernameKey = req.params.username.replace(new RegExp('\\+', 'g'), ' ');

    // verify that the name is identical in URI and JSON
    if (usernameKey != customer.user_name) {
        utils.sendJSONResponse(req, res, {
            result: 'failure',
            description: 'username in URI is \"' + usernameKey + '\", username in JSON is \"' + customer.user_name + '\"'
        });
        console.log('username in URI is \"' + usernameKey + '\", username in JSON is \"' + customer.user_name + '\"');
        return;
    }

    // verify that a customer with that username doesn't already exist
    db.view('customers/byName', { key: customer.user_name }, function (err, doc) {
        if (err) {
            utils.sendJSONResponse(req, res, err);
            console.log('error while accessing view: ' + util.inspect(err));
            return;
        } else {
            if (doc.length > 0) {
                utils.sendJSONResponse(req, res, {
                    result: 'failure',
                    description: 'customer \"' + customer.user_name + '\", already exists'
                });
                console.log('customer \"' + customer.user_name + '\", already exists');
                return;
            }
            verifyObject();
        }
    });

    var newCustomer;

    function verifyObject() {
        if (!customer.user_name || !customer.name) {
            utils.sendJSONResponse(req, res, {
                result: 'failure',
                description: 'customer must at least have a username and display name'
            });
            console.log('customer must at least have a username and display name');
            return;
        } else if (customer.type != 'Customer') {
            utils.sendJSONResponse(req, res, {
                result: 'failure',
                description: 'customer must have type \"Customer\"'
            });
            console.log('customer must have type \"Customer\"');
            return;
        }

        var salt = bcryptjs.genSaltSync(10);
        var hash = bcryptjs.hashSync(customer.password, salt);

        newCustomer = new Customer();
        newCustomer.user_name = customer.user_name;
        newCustomer.name = customer.name;
        newCustomer.user_mail = customer.user_mail;
        newCustomer.social_coins = parseFloat(customer.social_coins);
        newCustomer.twitter = customer.twitter;
        newCustomer.facebook = customer.facebook;
        newCustomer.gravatar = customer.gravatar;
        newCustomer.password = hash;

        saveObject();
    }

    function saveObject() {
        db.save('customers/' + newCustomer.user_name, newCustomer, function (err, saveresult) {
            if (err) {
                utils.sendJSONResponse(req, res, { result: 'failure', description: 'error while posting customer: ' + err });
                console.log('error while posting customer: ' + err);
                return;
            } else {
                utils.sendJSONResponse(req, res, { result: 'success', user_name: customer.user_name });
                console.log('customer posted: ' + customer.user_name);
            }
        });
    }


};


/*
 * PUT one particular customer (update an already existing object)
 */

exports.put = function (req, res) {

    'use strict';

    var db = require('./tools').cradledb();
    var Customer = require('../models/customer');

    var newCustomer;
    try {
        newCustomer = req.body;
    } catch (err) {
        utils.sendJSONResponse(req, res, {
            result: 'failure',
            description: 'posted data cannot be parsed as JSON: ' + err
        });
        console.log('posted data cannot be parsed as JSON: ' + err);
        return;
    }

    // support for using '+' as space character
    var usernameKey = req.params.username.replace(new RegExp('\\+', 'g'), ' ');

    var existingCustomer;

    // verify that the user already exists
    db.view('customers/byName', { key: newCustomer.user_name}, function (err, doc) {
        if (err) {
            utils.sendJSONResponse(req, res, err);
            console.log('error while accessing view: ' + util.inspect(err));
            return;
        } else {
            if (doc.length != 1) {
                utils.sendJSONResponse(req, res, {
                    result: 'failure',
                    description: 'could not identify customer \"' + usernameKey + '\"'
                });
                console.log('could not identify customer \"' + usernameKey + '\"');
                return;
            } else {
                existingCustomer = doc[0].value;
                verifyObject();
            }
        }
    });

    function verifyObject() {
        if (!newCustomer.user_name || !newCustomer.name) {
            utils.sendJSONResponse(req, res, {
                result: 'failure',
                description: 'customer must at least have a user_name and display name'
            });
            console.log('customer must at least have a user_name and display name');
            return;
        } else if (newCustomer.type != 'Customer') {
            utils.sendJSONResponse(req, res, {
                result: 'failure',
                description: 'customer must have type \"Customer\"'
            });
            console.log('customer must have type \"Customer\"');
            return;
        }
        updateObject();
    }
    
    function updateObject() {
        db.merge(existingCustomer._id, { user_name: newCustomer.user_name,
        	name: newCustomer.name,
                user_mail: newCustomer.user_mail,
                social_coins: parseFloat(newCustomer.social_coins),
                facebook: newCustomer.facebook,
                twitter: newCustomer.twitter,
                gravatar: newCustomer.gravatar
        }, function (err, saveresult) {
            if (err) {
                utils.sendJSONResponse(req, res, { result: 'failure', description: 'error while updating customer: ' + err });
                console.log('error while updating customer: ' + err);
                return;
            } else {
                utils.sendJSONResponse(req, res, { result: 'success', user_name: newCustomer.user_name });
                console.log('customer updated: ' + newCustomer.user_name);
            }
        });
    }
};



/*
 * add social coins to one particular customer (update an already existing object)
 */

exports.addCoins = function (req, res) {

    'use strict';

    var db = require('./tools').cradledb();
    var Customer = require('../models/customer');

    var earnedCoinsObject;
    try {
    	earnedCoinsObject = req.body;
    } catch (err) {
        utils.sendJSONResponse(req, res, {
            result: 'failure',
            description: 'posted data cannot be parsed as JSON: ' + err
        });
        console.log('posted data cannot be parsed as JSON: ' + err);
        return;
    }

    // support for using '+' as space character
    var usernameKey = req.params.username.replace(new RegExp('\\+', 'g'), ' ');
    
    utils.addCoinsToCustomer(parseFloat(earnedCoinsObject.coins), usernameKey, function(err, doc) {
        if (err) {
            utils.sendJSONResponse(req, res, { result: 'failure', description: err});
        } else {
        	utils.sendJSONResponse(req, res, { result: 'success', customer: doc });
        }
    }); 
};



/*
 * DELETE one particular customer
 */

exports.del = function (req, res) {

    'use strict';

    var db = require('./tools').cradledb();
    var Customer = require('../models/customer');

    // support for using '+' as space character
    var usernameKey = req.params.user_name.replace(new RegExp('\\+', 'g'), ' ');

    var existingCustomer;

    // verify that a shopping list with the original name and user already exists
    db.view('customers/byName', { key: user_nameKey }, function (err, doc) {
        if (err) {
            utils.sendJSONResponse(req, res, err);
            console.log('error while accessing view: ' + util.inspect(err));
            return;
        } else {
            if (doc.length != 1) {
                utils.sendJSONResponse(req, res, {
                    result: 'failure',
                    description: 'could not identify customer \"' + usernameKey + '\"'
                });
                console.log('could not identify customer \"' + usernameKey + '\"');
                return;
            }
            existingCustomer = doc[0].value;
            deleteObject();
        }
    });

    function deleteObject() {
        db.remove(existingCustomer._id, function (err, saveresult) {
            if (err) {
                utils.sendJSONResponse(req, res, { result: 'failure', description: 'error while deleting customer: ' + err });
                console.log('error while deleting customer: ' + err);
                return;
            } else {
                utils.sendJSONResponse(req, res, { result: 'success', description: 'customer deleted: ' + usernameKey });
                console.log('customer deleted: ' + usernameKey);
            }
        });
    }
};

exports.login = function(req, res) {
    
    "use strict";
    
    var db = require('./tools').cradledb();

    // support for using '+' as space character
    var usernameKey = req.params.username.replace(new RegExp('\\+', 'g'), ' ');

    db.view('customers/byName', { key: usernameKey }, function (err, doc) {
        if (err) {
            utils.sendJSONResponse(req, res, { result: 'failure', description: 'error while querying database: ' + util.inspect(err) });
            console.log('error while accessing view: ' + util.inspect(err));
        } else {
            if (doc.length > 0) {
    
                var pwd = req.body.pwd;
                var customer = doc[0].value;

                if (bcryptjs.compareSync(pwd, customer.password)) {
                    req.session.username = customer.user_name;
                    utils.sendJSONResponse(req, res, { result: 'success', data: customer });
                }
                else {
                    utils.sendJSONResponse(req, res, { result: 'failure', description: 'username or password mismatch!' });
                }
            }
            else
                utils.sendJSONResponse(req, res, { result: 'failure', description: 'username or password mismatch!' });
        }
    });
};

exports.logout = function(req, res) {
    
    "use strict";
    var user = req.session.username || req.cookies['easy_dinner.loggedInUser'];

    req.session = null;
    
    utils.sendJSONResponse(req, res, { result: 'success', user_name: user });
};
