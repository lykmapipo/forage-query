'use strict';

/**
 * @description find an item by id 
 * @param  {Function} done [description]
 * @return {[type]}            [description]
 */
Query.prototype.findById = function(id, done) {
    /*jshint validthis:true*/
    var self = this;

    //set current operationeration
    self._operation = 'find';

    if (_.isFunction(id)) {
        done = id;
        id = undefined;
    }

    //build find query conditions
    if (id) {
        self._conditions.id = {
            operation: 'isEqual',
            value: id
        };
    }

    //set skip and limit conditions
    self.skip(0);
    self.limit(1);

    //exceute find query
    if (done && _.isFunction(done)) {
        self.find(done);
    }

    //return self
    return self;
};