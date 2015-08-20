'use strict';

/**
 * @description localForage query builder
 */
function Query() {
    //initialize empty condition collection
    this._conditions = {};
}


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
    switch (typeof operation) {
        case 'function':
            callback = operation;
            operation = null;
            break;
        case 'string':
            this._operation = operation;
            break;
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

    var promise = new Query.Promise(function(_resolve, _reject) {
        self.exec(function(error, result) {
            if (error) {
                _reject(error);
            } else {
                _resolve(result);
            }
        });
    });

    return promise.then(resolve, reject);
};


/**
 * @description extend localForage with querying capabilities
 * @param  {[type]} localForage [description]
 * @return {[type]}             [description]
 */
Query.extend = function(localForage) {
    //set localForage reference in query
    Query.prototype.localForage = localForage;
};

/**
 * @description use native promise by default
 * @type {[type]}
 */
Query.Promise = Promise;