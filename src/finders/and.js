(function(root, undefined) {

    'use strict';

    var Query = root.Query;


    /**
     * @function
     * @description specifies arguments for a $and condition
     * @param  {Object[]} conditions array of conditions
     * @return {Query}       this
     * @public
     * @see {@link https://docs.mongodb.org/manual/reference/operator/query/and/|$and}
     * @example
     * query.and([{ color: 'green' }, { status: 'ok' }])
     */
    Query.prototype.and = function(conditions) {
        /*jshint validthis:true*/
        var self = this;

        // tell what operation to perform
        self._operation = 'find';

        //build where clause and update current query conditions
        var criteria = {
            $and: conditions
        };

        //return self
        return self.where(criteria);
    };

}(this));