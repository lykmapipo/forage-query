(function(root, undefined) {

    'use strict';

    var Query = root.Query;


    /**
     * @function
     * @description specifies an $exists condition
     * @param  {String} [path]  optional item path to perform comparison on.
     *                        if not specified previous path will be used
     * @param  {Object} value a value to be compared with the path value
     * @return {Query}       this
     * @public
     * @see {@link https://docs.mongodb.org/manual/reference/operator/query/exists/|$exists}
     * @example
     * // { name: { $exists: true }}
     * Thing.where('name').exists()
     * Thing.where('name').exists(true)
     * Thing.find().exists('name')
     *
     * // { name: { $exists: false }}
     * Thing.where('name').exists(false);
     * Thing.find().exists('name', false);
     */
    Query.prototype.exists = function(path, value) {
        /*jshint validthis:true*/
        var self = this;

        // tell what operation to perform
        self._operation = 'find';

        //if no path and value set value to true
        if (_.size(arguments) === 0) {
            value = true;
        }

        //check if path is specified explicit
        if (_.size(arguments) === 2) {
            //if so, update path to use in the clause
            self._path = path;
            //set value
            value = value || true;
        }

        //otherwise only value specified
        else {
            //set value to be used in comparison
            value = path;
        }

        //build where clause and update current query conditions
        var criteria = {};
        criteria[self._path] = {
            '$exists': value
        };

        //return self
        return self.where(criteria);
    };

}(this));