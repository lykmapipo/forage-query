(function(root, undefined) {

    'use strict';

    var Query = root.Query;

    /**
     * @function
     * @description find one item based on the criteria specified
     * @param  {Object}   criteria condition for filter items
     * @param  {Function} done     a callback to invoke after find one item
     * @return {Query}    this
     * @public
     */
    Query.prototype.findOne = function(criteria, done) {
        /*jshint validthis:true*/
        var self = this;

        //tell what operation to perform
        self._operation = 'find';

        //check if criteria provided
        if (_.isFunction(criteria)) {
            done = criteria;
            criteria = undefined;
        }

        //build where clause based on criteria
        if (criteria) {
            self.where(criteria);
        }

        //implicit specify limit condition
        self.limit(1);

        //execute find query
        if (done && _.isFunction(done)) {
            self.find(done);
        }


        //return self
        return self;

    };

}(this));