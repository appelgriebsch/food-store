var utils = require('../lib/utils');
var util = require('util');
var async = require('async');
var app = require('../lib/configs').app;

/*
 * GET the item list for one particular shopping list
 */

exports.single = function (req, res) {

    'use strict';

    var db = require('./tools').cradledb();

    // support for using '+' as space character
	var usernameKey = req.params.username.replace(new RegExp('\\+', 'g'), ' ');
    var shoppinglistNameKey = req.params.shoppinglistName.replace(new RegExp('\\+', 'g'), ' ');
	var viewKey = { key: { user:usernameKey, name:shoppinglistNameKey } };

	var demandsArray = [];
	var userObject = null;
	var demandsTagsWeights = {};
	var itemsIDs = [];
	var itemsArray = [];
	var returnItemsAndWeightProducts = [];

    db.view('shoppinglists/byUserAndName', viewKey, function (err, doc) {
        if (err) {
            utils.sendJSONResponse(req, res, { result: 'failure', description: 'error while querying database: ' + util.inspect(err) });
            console.log('error while accessing view: ' + util.inspect(err));
        } else {
            if (doc.length > 0) {
            	demandsArray = doc[0].value.demands;
            	getUserObject();
            } else {
                utils.sendJSONResponse(req, res, { result: 'failure', description: 'requested shopping list \"' + shoppinglistNameKey + '\" not found for user \"' + usernameKey + '\"' }, 404);
            }
        }
    });

    function getUserObject() {
        db.view('customers/byName', { key: usernameKey }, function (err, doc) {
            if (err) {
                utils.sendJSONResponse(req, res, { result: 'failure', description: 'error while querying database: ' + util.inspect(err) });
                console.log('error while accessing view: ' + util.inspect(err));
            } else {
                if (doc.length > 0) {
                	userObject = doc[0].value;
                	generateDemandTagWeights();
                } else {
                    utils.sendJSONResponse(req, res, { result: 'failure', description: 'user \"' + usernameKey + '\" not found' }, 404);
                }
            }
        });
    }

    function generateDemandTagWeights() {
    	var work;
    	work = async.queue(function(demand, done) {
    		getDemandTagWeight(demand, done);
        }, 10);

        work.drain = function() {
			//console.log('finished for all demands:');
			//console.dir(demandsTagsWeights);
        	generateItemList();
        };

        if (demandsArray.length > 0) {
	        for (var i = 0; i < demandsArray.length; i++) {
	        	work.push(demandsArray[i]);
	        };
        } else {
			console.log('shopping list contains no demands, returning empty item list');
        	buildResult();
        }
	}

    function getDemandTagWeight(demand, finishedWork) {
		var work = async.queue(function(tag, done) {
			//console.log('work function with tag \"' + tag + '\"');
			if (tag) {
				var viewKey = { key: { demand:demand.description, tag:tag.toLowerCase() } };
				//console.log('viewKey follows');
				//console.dir(viewKey);
				db.view('shoppinglists/byDemandAndTag', viewKey, function (err, doc) {
					if (err) {
						utils.sendJSONResponse(req, res, { result: 'failure', description: 'error while querying database: ' + util.inspect(err) });
						console.log('error while accessing view: ' + util.inspect(err));
					} else {
						//console.log('doc follows');
						//console.dir(doc);
						if (doc.length > 0) {
							if (!demandsTagsWeights[demand.description]) {
								demandsTagsWeights[demand.description] = [];
								demandsTagsWeights[demand.description].push( { tag:demand.description.toLowerCase(), weight:0.5 } );
							}
							demandsTagsWeights[demand.description].push( { tag:tag.toLowerCase(), weight:doc[0].value } );
							//console.dir(demandsTagsWeights[demand.description][demandsTagsWeights[demand.description].length-1]);
						}
						done();
					}
				});
			}
    	}, 10);

		if (demand.tags.length > 0) {
			demand.tags.forEach( function(tag) {
				work.push(tag.toLowerCase());
			});
		} else {
			console.log('demand \"' + demand.description + '\" has empty tags array');
			finishedWork();
		}

		work.drain = function() {
			//console.log('finished for demand \"' + demand.description + '\"');
			finishedWork();
		};
    }

	function generateItemList() {
    	var work = async.queue( function(demandTW, done) {
        	//console.log('>>>');
        	//console.dir(demandTW);
    		getItemForDemandTW(demandTW, done);
        }, 10);

        work.drain = function() {
           	for (var demandDesc in returnItemsAndWeightProducts) {
           		returnItemsAndWeightProducts[demandDesc] = returnItemsAndWeightProducts[demandDesc].sort( function(a, b) {
           			return a.weightProduct - b.weightProduct;
           		});

           		if (!itemsIDs[demandDesc]) {
           			itemsIDs[demandDesc] = [];
           		}
           		for (var i = 0; i < returnItemsAndWeightProducts[demandDesc].length; i++) {
           			if (itemsIDs[demandDesc].length >= 3) break; // we only need the top 3 search results
           			if (itemsIDs[demandDesc].indexOf(returnItemsAndWeightProducts[demandDesc][i].itemID) === -1) {
           				itemsIDs[demandDesc].push(returnItemsAndWeightProducts[demandDesc][i].itemID);
           			}
           		}
           	}
           	//console.log('SORTED returnItemsAndWeightProducts follows');
           	//console.dir(returnItemsAndWeightProducts);

           	//console.log('itemsIDs follows');
           	//console.dir(itemsIDs);

        	buildItemsArray();
        };

        if (Object.keys(demandsTagsWeights).length > 0) {
	        for (var demandDesc in demandsTagsWeights) {
	        	var demandTW = demandsTagsWeights[demandDesc];
	        	//console.log('---');
	        	//console.dir(demandTW);
	        	work.push({ demandDesc:demandDesc, demandTW: demandTW } );
	        }
        } else {
        	console.log('demandsTagsWeights is empty');
        	buildItemsArray();
        }
	}

	function getItemForDemandTW(demandTW, finishedWork) {
		var returnItem;
		var returnWeight;
		var work;

		work = async.queue(function(searchObject, done) {
    		var searchTerm = searchObject.term;
    		var searchTermWeight = searchObject.weight;
    		var desc = searchObject.desc;
            if (searchTerm) {
				db.view('items/byTag', { key:searchTerm }, function (err, doc) {
                    if (err) {
                        utils.sendJSONResponse(req, res, { result: 'failure', description: 'error while searching: ' + err });
                        throw 'error while searching: ' + err;
                    } else {
                    	if (doc.length > 0) {
                    		for (var i = 0; i < doc.length; i++) {
                            	var currentItem = doc[i];
                            	if (!returnItemsAndWeightProducts[desc]) {
                            		returnItemsAndWeightProducts[desc] = [];
                            	}
                            	returnItemsAndWeightProducts[desc].push( { itemID:currentItem.id, weightProduct:currentItem.value*searchTermWeight } );
                    		}
                    	}
                    }
                    done(err);
                });
            }
        }, 10);

    	//console.log('***');
    	//console.dir(demandTW);

		demandTW.demandTW.forEach( function(tagAndWeight) {
    		var tag = tagAndWeight.tag;
        	var weight = tagAndWeight.weight;
            work.push({term:tag.toLowerCase(), weight:weight, desc:demandTW.demandDesc});
    	});

        work.drain = function() {
        	finishedWork();
        };
	}

	function buildItemsArray() {
		var work;
    	work = async.queue(function(searchObject, done) {
    		var itemID = searchObject.itemID;
    		var demandDesc = searchObject.desc;
    		var demandIndex = searchObject.demandIndex;
            if (itemID) {
				db.view('items/all', { key:itemID }, function (err, doc) {
                    if (err) {
                        utils.sendJSONResponse(req, res, { result: 'failure', description: 'error while searching: ' + err });
                        throw 'error while searching: ' + err;
                    } else {
                    	if (doc.length > 0) {
                           	itemsArray[demandIndex].items.push(doc[0].value);
                    	}
                    }
                    done(err);
                });
            }
        }, 10);

        var demandIndex = 0;
        if (Object.keys(itemsIDs).length > 0) {
	    	for (var demandDesc in itemsIDs) {
	        	itemsArray.push( { demand:demandDesc, items:[] } );
	        	var demandItemIDs = itemsIDs[demandDesc];
	        	for (var i = 0; i < demandItemIDs.length; i++) {
	                work.push({demandIndex:demandIndex, desc:demandDesc, itemID:demandItemIDs[i]});
	        	}
	        	demandIndex++;
	        }
        } else {
        	console.log('itemsIDs is empty');
        	buildResult();
        }

        work.drain = function() {
        	//console.dir(itemsArray);
        	buildResult();
        };
	}


	function buildResult() {
		var resultDictionary = {
								customer: userObject,
								results: itemsArray
							};
		//console.dir(resultDictionary);
		var totalItems = 0;
		itemsArray.forEach( function (demandArray) {
			totalItems += demandArray.items.length;
		});
		console.log('returning total ' + totalItems + ' items for ' + itemsArray.length + ' demands in shoppinglist \"' + shoppinglistNameKey + '\" of user ' + usernameKey);
                req.session.username = userObject.user_name;
                res.cookie(app.name + '.loggedInUser', userObject.user_name);
		utils.sendJSONResponse(req, res, { result: 'success', data: resultDictionary });
	}
};
