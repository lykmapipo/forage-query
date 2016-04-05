(function(root, undefined) {

    'use strict';

    var Query = root.Query;

    /**
     * @function
     * @description specifies a path for use with chaining
     * @param  {Object}   criteria valid query object
     * @param  {Function} [done]   callback to invoke on success or error
     * @return {Query}             query instance
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
        //TODO parse regex
        //TODO allow for inverted condition
        //TODO parse mongodb like, query filter

        /*jshint validthis:true*/
        var self = this;

        var paths = _.keys(criteria);

        _.forEach(paths, function(path) {
            //normalize criteria value to adhere to mongodb query style
            var criteriaValue = criteria[path];

            //convert primitives `equal` to use $eq query builder
            //to allow `query.eq` chain
            //i.e
            //query.where(name).eq('<name>').where('email').eq('<email>')
            if (!_.isPlainObject(criteriaValue)) {
                criteriaValue = {
                    '$eq': criteriaValue
                };
            }

            //check if path already exists in conditions
            if (_.has(self._conditions, path)) {
                //update to use complex path
                var _condition = self._condition[path];
                self._conditions[path] = _.extend(_condition, criteriaValue);
            }

            //add simple path in _conditions
            else {
                self._conditions[path] = criteriaValue;
            }
        });
    };

}(this));