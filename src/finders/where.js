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

    //if it plain object merge it into conditions
    if (_.isPlainObject(criteria)) {
        self._conditions = _.merge(self._conditions, criteria);
    }

    //exceute find query
    if (done && _.isFunction(done)) {
        self.find(done);
    }


    //return self
    return self;

};


Query.prototype.eq = function(path, value) {
    /*jshint validthis:true*/
    var self = this;

    // tell what operation to perform
    self._operation = 'find';

    //check if path is specified explicit
    if (_.size(arguments) === 2) {
        //update path to use in the clause
        self._path = path;
    }

    //merge current isEqual condition
    //and override any condition set to current path
    self._conditions[self._path] = {
        operation: 'isEqual',
        value: value
    };

    //return self
    return self;
};