'use strict';


/**
 * @description build where equal clause
 * @param  {String} path  a item path to perform comparison on
 * @param  {Mixed} value a value to be compared with the path value
 * @return {Query}       [description]
 */
Query.prototype.eq = function(path, value) {
    /*jshint validthis:true*/
    var self = this;

    // tell what operation to perform
    self._operation = 'find';

    //check if path is specified explicit
    if (_.size(arguments) === 2) {
        //update path to use in the clause
        self._path = path;
    }

    //otherwise only value specified
    else {
        value = path;
    }

    //merge current isEqual condition
    //and override any condition set to current path
    self._conditions[self._path] = {
        operation: 'isEqual',
        value: value
    };

    //return self
    return self;
};