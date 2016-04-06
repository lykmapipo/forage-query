(function(root, undefined) {

    'use strict';

    var Query = root.Query;


    /**
     * @function
     * @description specifies a $gte query condition.
     * @param  {String} [path]  optional item path to perform comparison on.
     *                        if not specified previous path will be used
     * @param  {Object} value a value to be compared with the path value
     * @return {Query}       this
     * @public
     * @see {@link http://docs.mongodb.org/manual/reference/operator/gte/|$gte}
     * @example
     * Thing.find().where('age').gte(21)
     *
     * // or
     * Thing.find().gte('age', 21)
     */
    Query.prototype.gte = function(path, value) {
        /*jshint validthis:true*/
        var self = this;

        // tell what operation to perform
        self._operation = 'find';

        //check if path is specified explicit
        if (_.size(arguments) === 2) {
            //if so, update path to use in the clause
            self._path = path;
        }

        //otherwise only value specified
        else {
            //set value to be used in comparison
            value = path;
        }

        //build where clause and update current query conditions
        var criteria = {};
        criteria[self._path] = {
            '$gte': value
        };

        //return self
        return self.where(criteria);
    };

}(this));