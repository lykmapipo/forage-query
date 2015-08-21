'use strict';

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

    //tell what operation to perform
    self._operation = 'create';

    if (_.isFunction(data)) {
        done = data;
        data = undefined;
    }

    if (data) {
        //prepare id for storing an item
        self._id = data.id || uuid.v1();

        //delete key or id
        delete data.id;

        //tell which data to create
        self._data = data;
    }

    //execute query
    if (done && _.isFunction(done)) {

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

    //else return self
    return self;
};