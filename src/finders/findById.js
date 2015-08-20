'use strict';

/**
 * @description find an item by id 
 * @param  {Function} done [description]
 * @return {[type]}            [description]
 */
Query.prototype.findById = function(id, done) {
    /*jshint validthis:true*/
    var self = this;

    if (_.isFunction(id)) {
        done = id;
        id = undefined;
    }

    //build find query conditions
    if (id) {
        self._conditions = _.merge(this._conditions, {
            id: id
        });
    }

    //set current operationeration
    self._operation = 'find';

    //exceute find query
    if (done && _.isFunction(done)) {
        self.find(done);
    }

    //return self
    return self;
};