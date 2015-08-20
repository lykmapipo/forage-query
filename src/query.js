'use strict';


/**
 * @description localForage query builder
 */
function Query() {

}

/**
 * @description extend localForage with querying capabilities
 * @param  {[type]} localForage [description]
 * @return {[type]}             [description]
 */
Query.extend = function(localForage) {
    //set localForage reference in query
    Query.prototype.localForage = localForage;
};