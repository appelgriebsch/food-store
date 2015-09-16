var utils = require('../lib/utils');
var util = require('util');
var tools = require('./tools');

/*
 * GET list of all shopping lists
 */

exports.list = function (req, res) {

    'use strict';

    var db = require('./tools').cradledb();
    
    // are we querying for a particular username? 
	var viewKey = null;
    if (req.params.username) {
        // support for using '+' as space character
    	var usernameKey = req.params.username.replace(new RegExp('\\+', 'g'), ' ');
    	viewKey = { key: usernameKey };
    }
    
    db.view('shoppinglists/byUser', viewKey, function (err, rows) {
        if (err) {
            utils.sendJSONResponse(req, res, { result: 'failure', description: 'error while querying database: ' + util.inspect(err) });
            console.log('error while accessing view: ' + util.inspect(err));
            return;
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
            if (result.length > 0) {
            	utils.sendJSONResponse(req, res, { result: 'success', data: result });
            } else {
            	if (viewKey) {
            		utils.sendJSONResponse(req, res, { result: 'failure', description: 'no shopping lists found for user \"' + req.params.username + "\"" });
            	} else {
            		utils.sendJSONResponse(req, res, { result: 'failure', description: 'no shopping lists found' });
            	}
            }
        }
    });
};


/*
 * GET one particular shopping list
 */

exports.single = function (req, res) {

    'use strict';

    var db = require('./tools').cradledb();

    // support for using '+' as space character
	var usernameKey = req.params.username.replace(new RegExp('\\+', 'g'), ' ');
    var shoppinglistNameKey = req.params.shoppinglistName.replace(new RegExp('\\+', 'g'), ' ');
	var viewKey = { key: { user:usernameKey, name:shoppinglistNameKey } };
    
    db.view('shoppinglists/byUserAndName', viewKey, function (err, doc) {
        if (err) {
            utils.sendJSONResponse(req, res, { result: 'failure', description: 'error while querying database: ' + util.inspect(err) });
            console.log('error while accessing view: ' + util.inspect(err));
        } else {
            if (doc.length > 0) {
                utils.sendJSONResponse(req, res, { result: 'success', data: doc[0].value });
            } else {
            	if (req.params.username) {
                    utils.sendJSONResponse(req, res, { result: 'failure', description: 'requested shopping list \"' + shoppinglistNameKey + '\" not found for user \"' + usernameKey + '\"' });
            	} else {
                    utils.sendJSONResponse(req, res, { result: 'failure', description: 'requested shopping list not found: ' + shoppinglistNameKey });
            	}
            }
        }
    });
};


/*
 * GET all demands of one particular shopping list
 */

exports.getDemands = function (req, res) {

    'use strict';

    var db = require('./tools').cradledb();

    // support for using '+' as space character
	var usernameKey = req.params.username.replace(new RegExp('\\+', 'g'), ' ');
    var shoppinglistNameKey = req.params.shoppinglistName.replace(new RegExp('\\+', 'g'), ' ');
	var viewKey = { key: { user:usernameKey, name:shoppinglistNameKey } };
    
    db.view('shoppinglists/byUserAndName', viewKey, function (err, doc) {
        if (err) {
            utils.sendJSONResponse(req, res, { result: 'failure', description: 'error while querying database: ' + util.inspect(err) });
            console.log('error while accessing view: ' + util.inspect(err));
        } else {
            if (doc.length > 0) {
            	var shoppingList = doc[0].value;
                utils.sendJSONResponse(req, res, { result: 'success', data: shoppingList.demands });
            } else {
            	if (req.params.username) {
                    utils.sendJSONResponse(req, res, { result: 'failure', description: 'requested shopping list \"' + shoppinglistNameKey + '\" not found for user \"' + usernameKey + '\"' });
            	} else {
                    utils.sendJSONResponse(req, res, { result: 'failure', description: 'requested shopping list not found: ' + shoppinglistNameKey });
            	}
            }
        }
    });
};


/*
 * GET one particular demand of one particular shopping list
 */

exports.getDemand = function (req, res) {

    'use strict';

    var db = require('./tools').cradledb();

    // support for using '+' as space character
	var usernameKey = req.params.username.replace(new RegExp('\\+', 'g'), ' ');
    var shoppinglistNameKey = req.params.shoppinglistName.replace(new RegExp('\\+', 'g'), ' ');
    var demandIDKey = req.params.demandID.replace(new RegExp('\\+', 'g'), ' ');
	var viewKey = { key: { user:usernameKey, name:shoppinglistNameKey } };
    
    db.view('shoppinglists/byUserAndName', viewKey, function (err, doc) {
        if (err) {
            utils.sendJSONResponse(req, res, { result: 'failure', description: 'error while querying database: ' + util.inspect(err) });
            console.log('error while accessing view: ' + util.inspect(err));
        } else {
            if (doc.length > 0) {
            	var shoppingList = doc[0].value;
                for (var i = 0; i < shoppingList.demands.length; i++) {
                	if (shoppingList.demands[i].id == demandIDKey) {
                        utils.sendJSONResponse(req, res, { result: 'success', data: shoppingList.demands[i] });
                		return;
                	}
                }
                utils.sendJSONResponse(req, res, { result: 'failure', description: 'requested demand with ID \"' + demandIDKey + '\" not found in shopping list \"' + shoppinglistNameKey + '\" not found' });
            } else {
            	if (req.params.username) {
                    utils.sendJSONResponse(req, res, { result: 'failure', description: 'requested shopping list \"' + shoppinglistNameKey + '\" not found for user \"' + usernameKey + '\"' });
            	} else {
                    utils.sendJSONResponse(req, res, { result: 'failure', description: 'requested shopping list not found: ' + shoppinglistNameKey });
            	}
            }
        }
    });
};


/*
 * POST one particular shopping list
 */

exports.post = function (req, res) {

    'use strict';

    var db = require('./tools').cradledb();
    var ShoppingList = require('../models/shoppinglist');

    var shoppinglist;
    try {
        shoppinglist = req.body;
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
    var shoppinglistNameKey = req.params.shoppinglistName.replace(new RegExp('\\+', 'g'), ' ');
	var viewKey = { key: { user:usernameKey, name:shoppinglistNameKey } };

    // verify that the username is identical in URI and JSON
    if (usernameKey != shoppinglist.user) {
        utils.sendJSONResponse(req, res, {
            result: 'failure',
            description: 'user in URI is \"' + usernameKey + '\", user in JSON is \"' + shoppinglist.user + '\"'
        });
        console.log('user in URI is \"' + usernameKey + '\", user in JSON is \"' + shoppinglist.user + '\"');
        return;
    }

    // verify that the shoppinglist name is identical in URI and JSON
    if (shoppinglistNameKey != shoppinglist.name) {
        utils.sendJSONResponse(req, res, {
            result: 'failure',
            description: 'name in URI is \"' + shoppinglistNameKey + '\", name in JSON is \"' + shoppinglist.name + '\"'
        });
        console.log('name in URI is \"' + shoppinglistNameKey + '\", name in JSON is \"' + shoppinglist.name + '\"');
        return;
    }

    // verify that a shopping list with that name and user doesn't already exist
    db.view('shoppinglists/byUserAndName', viewKey, function (err, doc) {
        if (err) {
            utils.sendJSONResponse(req, res, err);
            console.log('error while accessing view: ' + util.inspect(err));
            return;
        } else {
            if (doc.length > 0) {
                utils.sendJSONResponse(req, res, {
                    result: 'failure',
                    description: 'user \"' + shoppinglist.user + '\", already has a shopping list \"' + shoppinglist.name + '\"'
                });
                console.log('user \"' + shoppinglist.user + '\", already has a shopping list \"' + shoppinglist.name + '\"');
                return;
            }
            verifyObject();
        }
    });

    var newShoppingList;

    function verifyObject() {
        if (!shoppinglist.name || !shoppinglist.user || !shoppinglist.type) {
            utils.sendJSONResponse(req, res, {
                result: 'failure',
                description: 'shopping list must at least have a name, user, and type'
            });
            console.log('shopping list must at least have a name, user, and type');
            return;
        } else if (shoppinglist.type != 'ShoppingList') {
            utils.sendJSONResponse(req, res, {
                result: 'failure',
                description: 'shopping list must have type \"ShoppingList\"'
            });
            console.log('shopping list must have type \"ShoppingList\"');
            return;
        }

        newShoppingList = new ShoppingList;
        newShoppingList.name = shoppinglist.name;
        newShoppingList.user = shoppinglist.user;
        newShoppingList.color = shoppinglist.color || 'C0C0C0';
        newShoppingList.demands = shoppinglist.demands || [];
        
        var ids;
    	tools.cradleconnection().uuids(newShoppingList.demands.length, function(err, result) {
    		if (err) {
    			console.log(err);
    		} else {
    			ids = result;
    			
    	        newShoppingList.demands.forEach( function(demand) {
    	        	if (!demand.id) demand.id = ids.pop();
    	        });

    	        saveObject();
    		}
        });
    }

    function saveObject() {
        var id = utils.generateSlug(newShoppingList.user + '-' + newShoppingList.name);

        db.save(id, newShoppingList, function (err, saveresult) {
            if (err) {
                utils.sendJSONResponse(req, res, { result: 'failure', description: 'error while posting shopping list: ' + err });
                console.log('error while posting shopping list: ' + err);
                return;
            } else {
                utils.sendJSONResponse(req, res, { result: 'success', description: 'shopping list posted: ' + shoppinglist.name });
                console.log('shopping list posted: ' + shoppinglist.name);
            }
        });
    }
};


/*
 * PUT one particular shopping list (update an already existing object)
 */

exports.put = function (req, res) {

    'use strict';

    var db = require('./tools').cradledb();
    var ShoppingList = require('../models/shoppinglist');

    var newShoppinglist;
    try {
        newShoppinglist = req.body;
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
    var shoppinglistNameKey = req.params.shoppinglistName.replace(new RegExp('\\+', 'g'), ' ');
	var viewKey = { key: { user:usernameKey, name:shoppinglistNameKey } };

    var existingShoppingList;

    // verify that a shopping list with the original name and user already exists
    db.view('shoppinglists/byUserAndName', viewKey, function (err, doc) {
        if (err) {
            utils.sendJSONResponse(req, res, err);
            console.log('error while accessing view: ' + util.inspect(err));
            return;
        } else {
            if (doc.length != 1) {
                utils.sendJSONResponse(req, res, {
                    result: 'failure',
                    description: 'could not identify shopping list \"' + shoppinglistNameKey + '\" for user \"' + usernameKey + '\"'
                });
                console.log('could not identify shopping list \"' + shoppinglistNameKey + '\" for user \"' + usernameKey + '\"');
                return;
            } else {
                existingShoppingList = doc[0].value;
                //console.log('existing:');
                //console.dir(existingShoppingList);
                //console.log('new:');
                //console.dir(newShoppinglist);
                if (newShoppinglist.name != existingShoppingList.name) {
                	// the list's name is supposed to change
                    //console.log('different name');
                    verifyNewListDoesNotExist();
                } else {
                    //console.log('unmodified name');
                	verifyObject();
                }
            }
        }
    });

    function verifyNewListDoesNotExist() {
        // verify that a shopping list with the new name and user doesn't already exist
        db.view('shoppinglists/byUserAndName', { key: {user:newShoppinglist.user, name:newShoppinglist.name} }, function (err, doc) {
            if (err) {
                utils.sendJSONResponse(req, res, err);
                console.log('error while accessing view: ' + util.inspect(err));
                return;
            } else {
                if (doc.length > 0) {
                    utils.sendJSONResponse(req, res, {
                        result: 'failure',
                        description: 'user \"' + newShoppinglist.user + '\" already has a shopping list \"' + newShoppinglist.name + '\"'
                    });
                    console.log('user \"' + newShoppinglist.user + '\" already has a shopping list \"' + newShoppinglist.name + '\"');
                    return;
                }
                verifyObject();
            }
        });
    }

    function verifyObject() {
        if (!newShoppinglist.name || !newShoppinglist.user || !newShoppinglist.type) {
            utils.sendJSONResponse(req, res, {
                result: 'failure',
                description: 'shopping list must at least have a name, user, and type'
            });
            console.log( 'shopping list must at least have a name, user, and type');
            return;
        } else if (newShoppinglist.type != 'ShoppingList') {
            utils.sendJSONResponse(req, res, {
                result: 'failure',
                description: 'shopping list must have type \"ShoppingList\"'
            });
            console.log('shopping list must have type \"ShoppingList\"');
            return;
        } else if (newShoppinglist.user != existingShoppingList.user) {
            utils.sendJSONResponse(req, res, {
                result: 'failure',
                description: 'not allowed to change the user of the shopping list'
            });
            console.log('not allowed to change the user of the shopping list');
            return;
        }
        
        var ids;
    	tools.cradleconnection().uuids(newShoppinglist.demands.length, function(err, result) {
    		if (err) {
    			console.log(err);
    		} else {
    			ids = result;
    			
    			newShoppinglist.demands.forEach( function(demand) {
    	        	if (!demand.id) demand.id = ids.pop();
    	        });

    	        updateObject();
    		}
        });
    }

    function updateObject() {
    	//console.log('existingShoppingList._id: ' + existingShoppingList._id);
        db.merge(existingShoppingList._id, { name: newShoppinglist.name, color: newShoppinglist.color || 'C0C0C0', demands: newShoppinglist.demands || [] }, function (err, saveresult) {
            if (err) {
                console.dir(err);
                utils.sendJSONResponse(req, res, { result: 'failure', description: 'error while updating shopping list: ' + err });
                console.log('error while updating shopping list: ' + err);
                return;
            } else {
                utils.sendJSONResponse(req, res, { result: 'success', description: 'shopping list updated: ' + newShoppinglist.name, location: require('path').dirname(req.path) + '/' + newShoppinglist.name.replace(new RegExp(' ', 'g'), '\+') });
                console.log('shopping list updated: ' + newShoppinglist.name + ' , location: ' + require('path').dirname(req.path) + '/' + newShoppinglist.name.replace(new RegExp(' ', 'g'), '\+'));
            }
        });
    }
};

/*
 * POST one particular demand to one particular shopping list
 */

exports.postDemand = function (req, res) {

    'use strict';

    var db = require('./tools').cradledb();
    var ShoppingList = require('../models/shoppinglist');

    var newDemand;
    try {
        newDemand = req.body;
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
    var shoppinglistNameKey = req.params.shoppinglistName.replace(new RegExp('\\+', 'g'), ' ');
	var viewKey = { key: { user:usernameKey, name:shoppinglistNameKey } };

    var existingShoppingList;
    var demandsArray;
    
    // verify that a shopping list with the name and user already exists
    db.view('shoppinglists/byUserAndName', viewKey, function (err, doc) {
        if (err) {
            utils.sendJSONResponse(req, res, err);
            console.log('error while accessing view: ' + util.inspect(err));
            return;
        } else {
            if (doc.length != 1) {
                utils.sendJSONResponse(req, res, {
                    result: 'failure',
                    description: 'could not identify shopping list \"' + shoppinglistNameKey + '\" for user \"' + usernameKey + '\"'
                });
                console.log('could not identify shopping list \"' + shoppinglistNameKey + '\" for user \"' + usernameKey + '\"');
                return;
            } else {
                existingShoppingList = doc[0].value;
                //console.log('existing:');
                //console.dir(existingShoppingList);
               	verifyObject();
            }
        }
    });

    function verifyObject() {
    	
    	//console.log('newDemand follows');
    	//console.dir(newDemand);
    	
        if (!newDemand.description || !newDemand.quantity || !newDemand.tags) {
            utils.sendJSONResponse(req, res, {
                result: 'failure',
                description: 'demand must at least have a description, quantity, and tags'
            });
            console.log('demand must at least have a description, quantity, and tags');
            return;
        }
        
        demandsArray = existingShoppingList.demands;
        
        var ids;
    	tools.cradleconnection().uuids(1, function(err, result) {
    		if (err) {
    			console.log(err);
    		} else {
    			ids = result;
    	       	if (!newDemand.id) newDemand.id = ids.pop();
    	        demandsArray.push(newDemand);
    	        
    	        updateObject();
    		}
        });
    }

    function updateObject() {
    	//console.log('existingShoppingList._id: ' + existingShoppingList._id);
        db.merge(existingShoppingList._id, { demands: demandsArray }, function (err, saveresult) {
            if (err) {
                console.dir(err);
                utils.sendJSONResponse(req, res, { result: 'failure', description: 'error while updating shopping list: ' + err });
                console.log('error while updating shopping list: ' + err);
                return;
            } else {
                utils.sendJSONResponse(req, res, { result: 'success', data:{ id:newDemand.id } });
                console.log('new demand added: ' + newDemand.description + ' id: ' + newDemand.id);
            }
        });
    }
};

/*
 * PUT one particular demand of one particular shopping list (update an already existing demand)
 */

exports.putDemand = function (req, res) {

    'use strict';

    var db = require('./tools').cradledb();
    var ShoppingList = require('../models/shoppinglist');

    var newDemand;
    try {
        newDemand = req.body;
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
    var shoppinglistNameKey = req.params.shoppinglistName.replace(new RegExp('\\+', 'g'), ' ');
    var demandIDKey = req.params.demandID.replace(new RegExp('\\+', 'g'), ' ');
	var viewKey = { key: { user:usernameKey, name:shoppinglistNameKey } };

    var existingShoppingList;
    var demandsArray;
    
    // verify that a shopping list with the name and user already exists
    db.view('shoppinglists/byUserAndName', viewKey, function (err, doc) {
        if (err) {
            utils.sendJSONResponse(req, res, err);
            console.log('error while accessing view: ' + util.inspect(err));
            return;
        } else {
            if (doc.length != 1) {
                utils.sendJSONResponse(req, res, {
                    result: 'failure',
                    description: 'could not identify shopping list \"' + shoppinglistNameKey + '\" for user \"' + usernameKey + '\"'
                });
                console.log('could not identify shopping list \"' + shoppinglistNameKey + '\" for user \"' + usernameKey + '\"');
                return;
            } else {
                existingShoppingList = doc[0].value;
                //console.log('existing:');
                //console.dir(existingShoppingList);
               	verifyObject();
            }
        }
    });

    function verifyObject() {
    	
    	//console.log('newDemand follows');
    	//console.dir(newDemand);
    	
        if (!newDemand.description || !newDemand.quantity || !newDemand.tags) {
            utils.sendJSONResponse(req, res, {
                result: 'failure',
                description: 'demand must at least have a description, quantity, and tags'
            });
            console.log('demand must at least have a description, quantity, and tags');
            return;
        }
        
        demandsArray = existingShoppingList.demands;
        var demandIndex = -1;
        for (var i = 0; i < demandsArray.length; i++) {
        	if (demandsArray[i].id == demandIDKey) {
        		demandIndex = i;
        		break;
        	}
        }
        
       	if (!newDemand.id) newDemand.id = demandIDKey;
        demandsArray.splice(demandIndex, 1, newDemand);
        
        updateObject();
    }

    function updateObject() {
    	//console.log('existingShoppingList._id: ' + existingShoppingList._id);
        db.merge(existingShoppingList._id, { demands: demandsArray }, function (err, saveresult) {
            if (err) {
                console.dir(err);
                utils.sendJSONResponse(req, res, { result: 'failure', description: 'error while updating shopping list: ' + err });
                console.log('error while updating shopping list: ' + err);
                return;
            } else {
                utils.sendJSONResponse(req, res, { result: 'success', description: 'shopping list updated: ' + existingShoppingList.name });
                console.log('shopping list updated: ' + existingShoppingList.name);
            }
        });
    }
};

/*
 * DELETE one particular demand of one particular shopping list
 */

exports.delDemand = function (req, res) {

    'use strict';

    var db = require('./tools').cradledb();
    var ShoppingList = require('../models/shoppinglist');

    // support for using '+' as space character
	var usernameKey = req.params.username.replace(new RegExp('\\+', 'g'), ' ');
    var shoppinglistNameKey = req.params.shoppinglistName.replace(new RegExp('\\+', 'g'), ' ');
    var demandIDKey = req.params.demandID.replace(new RegExp('\\+', 'g'), ' ');
	var viewKey = { key: { user:usernameKey, name:shoppinglistNameKey } };

    var existingShoppingList;
    var demandsArray;
    
    // verify that a shopping list with the name and user already exists
    db.view('shoppinglists/byUserAndName', viewKey, function (err, doc) {
        if (err) {
            utils.sendJSONResponse(req, res, err);
            console.log('error while accessing view: ' + util.inspect(err));
            return;
        } else {
            if (doc.length != 1) {
                utils.sendJSONResponse(req, res, {
                    result: 'failure',
                    description: 'could not identify shopping list \"' + shoppinglistNameKey + '\" for user \"' + usernameKey + '\"'
                });
                console.log('could not identify shopping list \"' + shoppinglistNameKey + '\" for user \"' + usernameKey + '\"');
                return;
            } else {
                existingShoppingList = doc[0].value;
               	verifyObject();
            }
        }
    });

    function verifyObject() {
        demandsArray = existingShoppingList.demands;
        var demandIndex = -1;
        for (var i = 0; i < demandsArray.length; i++) {
        	if (demandsArray[i].id == demandIDKey) {
        		demandIndex = i;
        		break;
        	}
        }
        
        demandsArray.splice(demandIndex, 1);
        
        updateObject();
    }

    function updateObject() {
        db.merge(existingShoppingList._id, { demands: demandsArray }, function (err, saveresult) {
            if (err) {
                console.dir(err);
                utils.sendJSONResponse(req, res, { result: 'failure', description: 'error while updating shopping list: ' + err });
                console.log('error while updating shopping list: ' + err);
                return;
            } else {
                utils.sendJSONResponse(req, res, { result: 'success', description: 'shopping list updated: ' + existingShoppingList.name });
                console.log('shopping list updated: ' + existingShoppingList.name);
            }
        });
    }
};

























/*
 * DELETE one particular shopping list
 */

exports.del = function (req, res) {

    'use strict';

    var db = require('./tools').cradledb();
    var ShoppingList = require('../models/shoppinglist');

    // support for using '+' as space character
	var usernameKey = req.params.username.replace(new RegExp('\\+', 'g'), ' ');
    var shoppinglistNameKey = req.params.shoppinglistName.replace(new RegExp('\\+', 'g'), ' ');
	var viewKey = { key: { user:usernameKey, name:shoppinglistNameKey } };

    var existingShoppingList;

    // verify that a shopping list with the original name and user already exists
    db.view('shoppinglists/byUserAndName', viewKey, function (err, doc) {
        if (err) {
            utils.sendJSONResponse(req, res, err);
            console.log('error while accessing view: ' + util.inspect(err));
            return;
        } else {
            if (doc.length != 1) {
                utils.sendJSONResponse(req, res, {
                    result: 'failure',
                    description: 'could not identify shopping list \"' + shoppinglistNameKey + '\"'
                });
                console.log('could not identify shopping list \"' + shoppinglistNameKey + '\"');
                return;
            }
            existingShoppingList = doc[0];
            deleteObject();
        }
    });

    function deleteObject() {
        db.remove(existingShoppingList.id, function (err, saveresult) {
            if (err) {
                console.dir(err);
                utils.sendJSONResponse(req, res, { result: 'failure', description: 'error while deleting shopping list: ' + err });
                console.log('error while deleting shopping list: ' + err);
                return;
            } else {
                utils.sendJSONResponse(req, res, { result: 'success', description: 'shopping list deleted: ' + shoppinglistNameKey });
                console.log('shopping list deleted: ' + shoppinglistNameKey);
            }
        });
    }
};
