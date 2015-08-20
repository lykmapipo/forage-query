'use strict';

/**
 * @description create an item from the provided data
 * @param  {Object} data data to create 
 * @param  {Function} done [description]
 * @return {Object}            an object containing a data and its key
 */
Query.prototype.create = function(data, done) {
    /*jshint validthis:true*/
    var self = this;

    if (_.isFunction(data)) {
        done = data;
        data = undefined;
    }

    if (data) {
        //prepare id for storing an item
        self._id = data.id || uuid.v1();

        //delete key or id
        delete data.id;

        //tell what operation to perform
        self._op = 'create';

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

                //if result its not an object construct it
                if (!_.isPlainObject(result)) {
                    result = {
                        id: self._id,
                        value: result
                    };
                }

                //extend an object with its key/id
                else {
                    result = _.extend(result, {
                        id: self._id
                    });
                }

                //we done return data
                done(null, result);
            }
        });
    }

    //else return self
    return self;
};