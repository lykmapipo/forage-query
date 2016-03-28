'use strict';

/**
 * @description sort query result based on criteria 
 * @param {Object} criteria  sorting critrias
 * @param  {Function} [done] a callback to invoke on suceess or error
 * @return {Query}           query instance
 */
Query.prototype.sort = function(criteria, done) {
	// jshint validthis:true
	var self = this;

	//tell what operation to perform
	self._operation = 'find';

	//normalize arguments
	if (criteria && _.isFunction(criteria)) {
		done = criteria;
		criteria = undefined;
	}

	//build where clause based on criteria
	if (criteria) {
		self._sort = _.merge({}, self._sort, criteria);
	}

	if (done && _.isFunction(done)) {
		//execute find query
		self.find(done);
	}

	return this;
};