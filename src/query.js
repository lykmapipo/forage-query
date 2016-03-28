'use strict';

/**
 * @description localForage query builder
 */
function Query() {
    //initialize empty condition collection
    this._conditions = {};

    //current path to be used in building query clause
    this._path = undefined;

    //specifies skip and limit conditions
    this._skip = undefined;
    this._limit = undefined;
}



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
    if (!self.Promise.defer) {
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
 */
Query.extend = function(localForage, promise) {
    //set query Promise library else use native promise
    Query.prototype.Promise = promise || Promise;

    //set localForage reference in query
    Query.prototype.localForage = localForage;

    //bind creators
    _.forEach(['create', 'insert'], function(creator) {
        //extend localforage with creators
        localForage[creator] = function(data, done) {
            //instantiate new query
            var query = new Query();

            //create provided data
            return query.create.call(query, data, done);
        };
    });

    //TODO bind Query methods into localForage instance
    //WARN! dont forget concurrency issues(parallel run)
};