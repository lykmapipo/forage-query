'use strict';

/**
 * @function
 * @description update existing item using specified criteria
 *  @param {Object} criteria selector
 * @param {Object} data updates
 * @param  {Function} [done]  a callback to invoke on success or error
 * @return {Query}            query instance
 * @public
 */
Query.prototype.findOneAndUpdate = function(criteria, data, done) {
	//jshint validthis:true
	var self = this;

	//normalize arguments
	if (criteria && _.isFunction(criteria)) {
		done = criteria;
		criteria = {};
	}

	//prepare criteria
	if (criteria) {
		//ensure limit
		self.limit(1);
	}

	return self.update(criteria, data, done);
};