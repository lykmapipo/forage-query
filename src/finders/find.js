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


    //iterate store and collect item(s) based on criteria
    self.localForage.iterate(function onItem(value, key /*, iterationNumber*/ ) {
        //if conditions contains id return item with the specified id
        if (self._conditions.id && key === self._conditions.id) {
            if (_.isPlainObject(value)) {
                return _.extend(value, {
                    id: key
                });
            } else {
                return {
                    id: key,
                    value: value
                };
            }
        }
    }, done);

    return self;
};