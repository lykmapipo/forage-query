(function(root, undefined) {

    'use strict';

    //ensure lodash has contains method
    if (_ && !_.contains) {
        _.contains = _.includes;
    }

    //TODO implement distinct query
    //TODO implement select query

    /**
     * @description localForage query builder
     */
    function Query() {
        //TODO make use of condition builder on top of Mingo.Query
        //initialize empty condition collection
        this._conditions = {};

        //specify aggregation type
        this._aggregation = undefined;

        //specify projections
        this._projection = undefined;

        //specify sort criterias
        this._sort = undefined;

        //current path to be used in building query clause
        this._path = undefined;

        //specifies skip and limit conditions
        this._skip = undefined;
        this._limit = undefined;
    }


    //reference Query
    Query.prototype.Query = Query;


    /**
     * @name _hasConditions
     * @description check if query has conditions
     * @return {Boolean}
     */
    Query.prototype._hasConditions = function() {
        /*jshint validthis:true*/
        var self = this;
        var hasConditions = self._conditions && _.keys(self._conditions).length > 0;
        return hasConditions;
    };


    /**
     * @function
     * @description build an item from its key value
     * @param  {String|Integer} key id of the value stored
     * @param  {Mixed} value actual value store
     * @return {Object}       a combination of key and value
     * @private
     */
    Query.prototype._buildItem = function(key, value) {
        if (_.isPlainObject(value)) {
            return _.extend(value, {
                id: key,
                _id: key
            });
        } else {
            return {
                id: key,
                _id: key,
                value: value
            };
        }
    };


    /**
     * @description Executes current query
     *
     * @example
     *     query.exec();
     *     query.exec(callback);
     *     query.exec('update');
     *     query.exec('find', callback);
     *
     * @param {String|Function} [operation]
     * @param {Function} [callback]
     * @api public
     */
    Query.prototype.exec = function exec(operation, callback) {
        if (_.isFunction(operation)) {
            callback = operation;
            operation = undefined;
        }

        if (operation) {
            this._operation = operation;
        }

        this[this._operation](callback);
    };


    /**
     * @description Executes the query returning a `Promise` which will be
     * resolved with either the doc(s) or rejected with the error.
     *
     * @param {Function} [resolve]
     * @param {Function} [reject]
     * @return {Promise}
     * @api public
     */

    Query.prototype.then = function(resolve, reject) {
        /*jshint validthis:true*/
        var self = this;
        var promise;

        //test angular 1.x promise
        if (!self.Promise.when) {
            promise = new self.Promise(function(_resolve, _reject) {
                self.exec(function(error, result) {
                    if (error) {
                        _reject(error);
                    } else {
                        _resolve(result);
                    }
                });
            });
        }
        // use angular 1.x $q promise
        else {
            promise = self.Promise(function(_resolve, _reject) {
                self.exec(function(error, result) {
                    if (error) {
                        _reject(error);
                    } else {
                        _resolve(result);
                    }
                });
            });
        }

        return promise.then(resolve, reject);
    };


    /**
     * @function
     * @description extend localForage with querying capabilities
     * @param  {Object} localForage an instance of localforage
     * @param {Object} [promise]    promise implementation to use. default to
     *                              native promise
     *
     * @return {Object} localforage instance with query capabilities
     * @public
     */
    Query.extend = function(localForage, promise) {
        //set query Promise library else use native promise
        Query.prototype.Promise = promise || Promise;

        //set localForage reference in query
        Query.prototype.localForage = localForage;

        //bind creators
        _.forEach(['create'], function(creator) {
            //extend localforage with creators
            localForage[creator] = function(data, done) {
                //instantiate new query
                var query = new Query();

                //create provided data
                return query.create.call(query, data, done);
            };
        });

        //bind finders
        _.forEach(['find', 'findOne', 'findById', 'where'], function(finder) {
            //extend localforage with finders
            localForage[finder] = function(criteria, done) {
                //instantiate new query
                var query = new Query();

                //expose finder
                return query[finder].call(query, criteria, done);
            };
        });

        //bind removers
        _.forEach(['remove', 'findByIdAndRemove', 'findOneAndRemove'], function(remover) {
            //extend localforage with removers
            localForage[remover] = function(criteria, done) {
                //instantiate new query
                var query = new Query();

                //expose remover
                return query[remover].call(query, criteria, done);
            };
        });

        //bind updators
        _.forEach(['update', 'findByIdAndUpdate', 'findOneAndUpdate'], function(updator) {
            //extend localforage with updators
            localForage[updator] = function(criteria, data, done) {
                //instantiate new query
                var query = new Query();

                //expose updator
                return query[updator].call(query, criteria, data, done);
            };
        });

        //bind default aggregator
        _.forEach(['count'], function(aggregator) {
            //extend localforage with aggregators
            localForage[aggregator] = function(criteria, done) {
                //instantiate new query
                var query = new Query();

                //expose aggregator
                return query[aggregator].call(query, criteria, done);
            };
        });

        return this.localForage;

    };


    //check node environment
    var nodeEnabled =
        ('undefined' !== typeof module && 'undefined' !== typeof require);

    // Export the forageQuery object for Node.js
    if (nodeEnabled) {
        module.exports = Query;
    } else {
        root.Query = Query;
    }

}(this));