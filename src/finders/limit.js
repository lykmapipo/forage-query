(function(root, undefined) {

    'use strict';

    var Query = root.Query;


    /**
     * @function
     * @description specifies the maximum number of documents the query will return
     * @param  {Integer} value a limit value
     * @return {Query}       
     * @public
     * @example
     * query.limit(20)
     */
    Query.prototype.limit = function(value) {
        /*jshint validthis:true*/
        var self = this;

        // tell what operation to perform
        self._operation = 'find';

        //check for explicit skip
        if (!self._skip) {
            //implicit set skip value to zero
            self._skip = 0;
        }

        //set a limit condition
        self._limit = value || 1;

        //return self
        return self;
    };

}(this));