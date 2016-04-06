(function(root, undefined) {

    'use strict';

    var Query = root.Query;


    /**
     * @function
     * @description specifies a $in query condition.
     * @param  {String} [path]  optional item path to perform comparison on.
     *                        if not specified previous path will be used
     * @param  {Object} value a value to be compared with the path value
     * @return {Query}       this
     * @public
     * @see {@link https://docs.mongodb.org/manual/reference/operator/query/in/|$in}
     * @example
     * Thing.find().where('age').in([ 5, 15 ])
     *
     * // or
     * Thing.find().in('age', [ 5, 15 ])
     */
    Query.prototype.in = function(path, value) {
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
            '$in': value
        };

        //return self
        return self.where(criteria);
    };

}(this));