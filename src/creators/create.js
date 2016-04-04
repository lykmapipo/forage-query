(function(root, undefined) {

    'use strict';

    var Query = root.Query;

    //TODO add validation
    //TODO handle primitives type
    //TODO add beforeCreate
    //TODO add afterCreate

    /**
     * @function
     * @description create an item from the provided data
     * @param  {Object} data data to create 
     * @param  {Function} done a callback to invoke after create an item
     * @return {Object}            an object containing a data and its key
     * @public
     */
    Query.prototype.create = function(data, done) {
        /*jshint validthis:true*/
        var self = this;

        if (_.isFunction(data)) {
            done = data;
            data = undefined;
        }

        //tell what operation to perform
        self._operation = 'create';

        //if is collection of items perform batch create
        if (data && _.isArray(data)) {
            self._create(data);
        }

        //create single item
        if (data && !_.isArray(data)) {
            //prepare id for storing an item
            self._id = data.id || data._id || uuid.v1();

            //delete key or id
            delete data.id;
            delete data._id;

            //tell which data to create
            self._data = data;
        }

        //execute query
        if (done && _.isFunction(done)) {

            //execute batch
            if (self._creates) {
                self._create(done);
            }
            //execute simple
            else {

                self.localForage.setItem(self._id, self._data, function(error, result) {
                    //if error back off
                    if (error) {
                        done(error);
                    }

                    //return created item
                    else {

                        result = self._buildItem(self._id, result);

                        //we done return data
                        done(null, result);
                    }
                });
            }
        }

        //else return self
        return self;
    };


    /**
     * @function
     * @name create
     * @param  {Array<Object>}   data collection of item to insert
     * @param  {Function} [done] callback to invoke on success or error
     * @return {Query}         query instance
     * @private
     */
    Query.prototype._create = function(data, done) {
        /*jshint validthis:true*/
        var self = this;

        if (_.isFunction(data)) {
            done = data;
            data = undefined;
        }

        if (data) {
            //compact data
            data = _.compact(data);

            //prepare batch create
            data = _.map(data, function(item) {
                var query = new self.Query();
                return query.create.call(query, item);
            });

            //perform batch creation
            data = _.compact(data);
            self._creates = self.Promise.all(data);
        }

        if (done && _.isFunction(done)) {
            self._creates.then(function(results) {
                return done(null, results);
            }).catch(function(error) {
                return done(error);
            });
        }

        return self;
    };

}(this));