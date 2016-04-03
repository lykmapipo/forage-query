'use strict';

/**
 * @description update a given item(s) using specified criteria
 * @param {Object} criteria selector
 * @param {Object} data updates
 * @param  {Function} [done]  a callback to invoke on success or error
 * @return {Query}             query instance
 */
Query.prototype.update = function(criteria, data, callback) {
	if (callback) {
		//run query
	} else {
		return this;
	}
};