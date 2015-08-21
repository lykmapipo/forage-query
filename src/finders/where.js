'use strict';

/**
 * @description query where clause builder
 * @param  {[type]}   criteria [description]
 * @param  {Function} done     [description]
 * @return {[type]}            [description]
 */
Query.prototype.where = function(criteria, done) {
    /*jshint validthis:true*/
    var self = this;

    //tell what operation to perform
    self._operation = 'find';

    //check if criteria provided
    if (_.isFunction(criteria)) {
        done = criteria;
        criteria = undefined;
    }

    //if it just a string set it as current path for query clause
    if (_.isString(criteria)) {
        self._path = criteria;
    }


    //if it plain object parse it into conditions
    if (_.isPlainObject(criteria)) {
        self._parseCriteria(criteria);
    }

    //execute find query
    if (done && _.isFunction(done)) {
        self.find(done);
    }


    //return self
    return self;

};


/**
 * @function
 * @description parse provided criteria into query condition
 * @param  {Object} criteria a valid criteria
 * @private
 */
Query.prototype._parseCriteria = function(criteria) {
    /*jshint validthis:true*/
    var self = this;

    var paths = _.keys(criteria);

    _.forEach(paths, function(path) {
        self._conditions[path] = {
            operation: 'isEqual',
            value: criteria[path]
        };
    });
};