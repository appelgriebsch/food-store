var utils = require('../lib/utils');
var util = require('util');
var async = require('async');

/*
 * Initialize backend
 */

exports.init = function (req, res) {

    'use strict';

    console.log('beginning initialization');

    var db = exports.cradledb();
    
    db.exists(function (err, exists) {

        if (err) {
            utils.sendJSONResponse(req, res, { result: 'failure', description: 'error while checking existence of database: ' + util.inspect(err) });
            throw 'error while checking existence of database: ' + util.inspect(err);
        } else if (!exists) {
            console.log('database \'' + db.name + '\' does not exist');
            createDB();
        }
        else {
            console.log('database \'' + db.name + '\' exists');
            db.all(function (err, result) {
                if (err) {
                    console.log('Error: %s', err);
                } else {
                	var work;
                	work = async.queue(function(doc, done) {
                        if (doc) {
                            db.remove(doc.key, doc.rev, function(err, deleteResult) {
                                if (err) {
                                    utils.sendJSONResponse(req, res, { result: 'failure', description: 'error while deleting document: ' + err });
                                    throw 'error while deleting document: ' + err;
                                }
                                done(err);
                            });
                        }
                    }, 10);

                    work.drain = function() {
                    	console.log(result.length + ' documents deleted');
                        saveViews();
                    };
                    
                    for (var i = 0; i < result.length; ++i) {
                        work.push(result[i]);
                    };

                }

                if (result.length == 0) saveViews();
            });
        }

        function createDB() {
            db.create(function (err) {
                if (err) {
                    utils.sendJSONResponse(req, res, { result: 'failure', description: 'error while creating database: ' + util.inspect(err) });
                    throw 'error while creating database: ' + util.inspect(err);
                }
                console.log('created database \'' + db.name + '\'');
                saveViews();
            });
        }

        function saveViews() {
            db.save('_design/recipes', {
                all: {
                    map: function (doc) {
                        if (doc.type && doc.type == 'Recipe') {
                            emit(doc._id, doc);
                        }
                    }
                },
                byName: {
                    map: function (doc) {
                        if (doc.type && doc.type == 'Recipe') {
                            emit(doc.name, doc);
                        }
                    }
                }
            },
                function (err, saveresult) {
                    if (err) {
                        utils.sendJSONResponse(req, res, { result: 'failure', description: 'error while creating design document: ' + util.inspect(err) });
                        throw 'error while creating design document: ' + util.inspect(err);
                    } else {
                        console.log('design document created: ' + saveresult.id);
                        db.save('_design/shoppinglists', {
                            all: {
                                map: function (doc) {
                                    if (doc.type && doc.type == 'ShoppingList') {
                                        emit(doc._id, doc);
                                    }
                                }
                            },
                            byName: {
                                map: function (doc) {
                                    if (doc.type && doc.type == 'ShoppingList') {
                                        emit(doc.name, doc);
                                    }
                                }
                            },
                            byUser: {
                                map: function (doc) {
                                    if (doc.type && doc.type == 'ShoppingList') {
                                        emit(doc.user, doc);
                                    }
                                }
                            },
                            byUserAndName: {
                                map: function (doc) {
                                    if (doc.type && doc.type == 'ShoppingList') {
                                        emit({user: doc.user, name:doc.name}, doc);
                                    }
                                }
                            },
                            byDemandAndTag: {
                            	map: function (doc) {
                            		if (doc.type && doc.type == 'ShoppingList') {
                            			doc.demands.forEach(function (demand) {
                            				var i = 1.5;
                            				demand.tags.forEach(function (tag) {
                            					emit({demand:demand.description, tag:tag.toLowerCase()}, i++);
                            				});
                            			});
                            		}
                            	}
                            }
                        },
						function (err, saveresult) {
							if (err) {
								utils.sendJSONResponse(req, res, { result: 'failure', description: 'error while creating design document: ' + util.inspect(err) });
								throw 'error while creating design document: ' + util.inspect(err);
							} else {
								console.log('design document created: ' + saveresult.id);
								db.save('_design/customers', {
									all: {
										map: function (doc) {
											if (doc.type && doc.type == 'Customer') {
												emit(doc._id, doc);
											}
										}
									},
									byName: {
										map: function (doc) {
											if (doc.type && doc.type == 'Customer') {
												emit(doc.user_name, doc);
											}
										}
									}
								},
								function (err, saveresult) {
									if (err) {
										utils.sendJSONResponse(req, res, { result: 'failure', description: 'error while creating design document: ' + util.inspect(err) });
										throw 'error while creating design document: ' + util.inspect(err);
									} else {
										console.log('design document created: ' + saveresult.id);
										db.save('_design/items', {
											all: {
												map: function (doc) {
													if (doc.type && doc.type == 'Item') {
														emit(doc._id, doc);
													}
												}
											},
											byName: {
												map: function (doc) {
													if (doc.type && doc.type == 'Item') {
														emit(doc.name.toLowerCase(), doc);
													}
												}
											},
											byTag: {
												map: function (doc) {
													if (doc.type && doc.type == 'Item') {
														var i = 1;
														doc.tags.forEach(function (tag) {
															emit(tag, i++);
														});
													}
												}
											}
										},
											function (err, saveresult) {
												if (err) {
													utils.sendJSONResponse(req, res, { result: 'failure', description: 'error while creating design document: ' + util.inspect(err) });
													throw 'error while creating design document: ' + util.inspect(err);
												} else {
													console.log('design document created: ' + saveresult.id);
													importRecipes();
												}
											});
									}
								});
							}
						});
                    }
                });
        }

        function importRecipes() {
            var fs = require('fs');
            var path = require('path');
            var recipesDirectory = path.resolve(__dirname, '../import/recipes');
            var recipes = [];

            fs.readdirSync(recipesDirectory).forEach(function (recipeFile) {
                var recipe;
                try {
                    recipe = JSON.parse(fs.readFileSync(path.join(recipesDirectory, recipeFile), {"encoding": "utf8"}));
                } catch (err) {
                    utils.sendJSONResponse(req, res, {
                        result: 'failure',
                        description: recipeFile + ' cannot be parsed as JSON: ' + err
                    });
                    console.log(recipeFile + ' cannot be parsed as JSON: ' + err);
                    recipe = undefined;
                } finally {
                    if (recipe) recipes.push(recipe);
                }
            });

            var importCount = 0;
            var idCount = 0;

            recipes.forEach(function (recipe) {
                var id = 'r' + idCount++; // minimized for better QR code scanability, normally we use utils.generateSlug(recipe.name)
                db.save(id, recipe, function (err) {
                    if (err) {
                        utils.sendJSONResponse(req, res, { result: 'failure', description: 'error while importing recipes: ' + util.inspect(err) });
                        throw 'error while importing recipes: ' + util.inspect(err);
                    } else {
                        importCount++;
                        if (importCount == recipes.length) {
                            console.log(recipes.length + ' recipes imported');
                            importItems();
                        }
                    }
                });
            });
        }

        function importItems() {
            var fs = require('fs');
            var path = require('path');
            var itemsDirectory = path.resolve(__dirname, '../import/items');
            var items = [];

            fs.readdirSync(itemsDirectory).forEach(function (itemFile) {
                var itemsInFile;
                try {
                    itemsInFile = JSON.parse(fs.readFileSync(path.join(itemsDirectory, itemFile), {"encoding": "utf8"}));
                } catch (err) {
                    utils.sendJSONResponse(req, res, {
                        result: 'failure',
                        description: itemFile + ' cannot be parsed as JSON: ' + err
                    });
                    console.log(itemFile + ' cannot be parsed as JSON: ' + err);
                    itemsInFile = undefined;
                } finally {
                    if (itemsInFile) {
                    	itemsInFile.forEach(function (item) {
                    		items.push(item);
                    	});
                    }
                }
            });

        	var work;
        	work = async.queue(function(item, done) {
                if (item) {
                    var id = utils.generateSlug(item.name);
                    db.save(id, item, function (err) {
                        if (err) {
                            utils.sendJSONResponse(req, res, { result: 'failure', description: 'error while importing items: ' + util.inspect(err) });
                            throw 'error while importing item ' + item.name + ': ' + util.inspect(err);
                        }
                        done(err);
                    });
                }
            }, 1);

            work.drain = function() {
            	console.log(items.length + ' items imported');
                importShoppingLists();
            };
            
            items.forEach(function (item) {
            	work.push(item);
            });
        }
        
        function importShoppingLists() {
            var fs = require('fs');
            var path = require('path');
            var shoppinglistsFile = path.resolve(__dirname, '../test/shoppinglists.json');
            var shoppinglists;
            try {
                shoppinglists = JSON.parse(fs.readFileSync(shoppinglistsFile));
            } catch (err) {
                utils.sendJSONResponse(req, res, {
                    result: 'failure',
                    description: shoppinglistsFile + ' cannot be parsed as JSON: ' + err
                });
                throw shoppinglistsFile + ' cannot be parsed as JSON: ' + err;
            }

            var importCount = 0;
            var importedShoppinglists = [];

            shoppinglists.forEach(function (shoppinglist) {
                var id = utils.generateSlug(shoppinglist.user + '-' + shoppinglist.name);
                db.save(id, shoppinglist, function (err) {
                    if (err) {
                        utils.sendJSONResponse(req, res, { result: 'failure', description: 'error while importing shopping lists: ' + util.inspect(err) });
                        throw 'error while importing shopping lists: ' + util.inspect(err);
                    } else {
                        importedShoppinglists.push(shoppinglist.name);
                        importCount++;
                        if (importCount == shoppinglists.length) {
                            console.log(shoppinglists.length + ' shopping lists imported: ' + importedShoppinglists);
                            importCustomers();
                        }
                    }
                });
            });
        }

        function importCustomers() {
            var fs = require('fs');
            var path = require('path');
            var customersFile = path.resolve(__dirname, '../test/customers.json');
            var customers;
            try {
                customers = JSON.parse(fs.readFileSync(customersFile));
            } catch (err) {
                utils.sendJSONResponse(req, res, {
                    result: 'failure',
                    description: customersFile + ' cannot be parsed as JSON: ' + err
                });
                throw customersFile + ' cannot be parsed as JSON: ' + err;
            }

            var importCount = 0;
            var importedCustomers = [];

            customers.forEach(function (customer) {
                var id = 'customers/' + customer.user_name;
                db.save(id, customer, function (err) {
                    if (err) {
                        utils.sendJSONResponse(req, res, { result: 'failure', description: 'error while importing customers: ' + util.inspect(err) });
                        throw 'error while importing customers: ' + util.inspect(err);
                    } else {
                        importedCustomers.push(customer.name);
                        importCount++;
                        if (importCount == customers.length) {
                            console.log(customers.length + ' customers imported: ' + importedCustomers);
                            finishInitialization();
                        }
                    }
                });
            });
        }

        function finishInitialization() {
            console.log('finished initialization');
            res.send({ result: 'success', description: 'finished initialization' });
        }
    });
};

/*
 * Provide a CouchDB database handle via cradle
 */

exports.cradledb = function () {

    'use strict';

    var cradle = require('cradle');
    var config = require('../lib/configs').couchdb;

    //console.log('couchdb/cradle config follows:');
    //console.dir(config);

    var connection = new cradle.Connection(
        config.host || 'localhost',
        config.port || 5984,
        {
            secure: config.SSL || false,
            auth: {
                username: config.user || 'foodstore',
                password: config.pass || '$PASS$'
            }
        });
    console.log('connected to couchdb at ' + connection.host + ':' + connection.port);
    return connection.database(config.database || 'foodstore');
};

/*
 * Provide a CouchDB connection handle via cradle
 */

exports.cradleconnection = function () {

    'use strict';

    var cradle = require('cradle');
    var config = require('../lib/configs').couchdb;

    var connection = new cradle.Connection(
        config.host || 'localhost',
        config.port || 5984,
        {
            secure: config.SSL || false,
            auth: {
                username: config.user || 'foodstore',
                password: config.pass || '$PASS$'
            }
        });
    return connection;
};
