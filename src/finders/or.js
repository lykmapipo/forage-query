(function(root, undefined) {

    'use strict';

    var Query = root.Query;


    /**
     * @function
     * @description specifies arguments for a $or condition
     * @param  {Object[]} conditions array of conditions
     * @return {Query}       this
     * @public
     * @see {@link $or}
     * @example
     * query.or([{ color: 'green' }, { status: 'ok' }])
     */
    Query.prototype.or = function(conditions) {
        /*jshint validthis:true*/
        var self = this;

        // tell what operation to perform
        self._operation = 'find';

        //build where clause and update current query conditions
        var criteria = {
            $or: conditions
        };

        //return self
        return self.where(criteria);
    };

}(this));