'use strict';

/**
 * @description find an item using specified criteria
 * @param  {Function} done [description]
 * @return {[type]}            [description]
 */
Query.prototype.find = function(criteria, done) {
    /*jshint validthis:true*/
    var self = this;

    //tell what operation to perform
    self._operation = 'find';

    if (_.isFunction(criteria)) {
        done = criteria;
        criteria = undefined;
    }

    //build or merge criterias
    if (criteria) {
        this._conditions = _.merge(this._conditions, criteria);
    }

    //if there is id return an item with associated id
    if (self._conditions.id && done && _.isFunction(done)) {
        self.localForage.getItem(self._conditions.id, function(error, result) {
            //if error back off
            if (error) {
                done(error);
            }

            //return created item
            else {

                //if result its not an object construct it
                if (!_.isPlainObject(result)) {
                    result = {
                        id: self._conditions.id,
                        value: result
                    };
                }

                //extend an object with its key/id
                else {
                    result = _.extend(result, {
                        id: self._conditions.id
                    });
                }

                //we done return data
                done(null, result);
            }
        });
    }

    //TODO build a criteria on toperation of iterator

    return self;
};