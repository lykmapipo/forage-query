'use strict';


/**
 * @description localForage query builder
 */
function Query() {}


/**
 * @description Executes currunt query
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
Query.prototype.exec = function exec(op, callback) {
    switch (typeof op) {
        case 'function':
            callback = op;
            op = null;
            break;
        case 'string':
            this._op = op;
            break;
    }

    this[this._op](callback);
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
    this._then = true;

    var promise = new Query.Promise(function(_resolve, _reject) {
        self.exec(function(error, result) {
            if (error) {
                _reject(error);
            } else {
                _resolve(result);
            }
            self = _resolve = _reject = null;
        });
    });

    return promise.then(resolve, reject);
};


/**
 * Hook callback into a promise.
 *
 * @param promise Promise to chain onto
 * @param callback Optional error first callback to invoke with promise
 * @return a promise
 * @private
 */
Query.prototype._promiseOrCallback = function(promise, callback) {
    if (callback) {
        return promise.then(function fulfilled(result) {
            callback(null, result);
        }, function rejected(reason) {
            callback(reason);
        });
    } else {
        return promise;
    }
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