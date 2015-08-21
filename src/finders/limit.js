'use strict';


/**
 * @function
 * @description specifies limit condition
 * @param  {Integer} value a limit value
 * @return {Query}       
 * @public
 */
Query.prototype.limit = function(value) {
    /*jshint validthis:true*/
    var self = this;

    // tell what operation to perform
    self._operation = 'find';

    //set a limit condition
    self._limit = value;

    //return self
    return self;
};