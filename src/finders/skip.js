'use strict';


/**
 * @function
 * @description specifies skip condition
 * @param  {Integer} value a skip value
 * @return {Query}       
 * @public
 */
Query.prototype.skip = function(value) {
    /*jshint validthis:true*/
    var self = this;

    // tell what operation to perform
    self._operation = 'find';

    //set a skip condition
    self._skip = value;

    //return self
    return self;
};