(function(root, undefined) {

	'use strict';

	var Query = root.Query;

	//TODO implement options

	/**
	 * @function
	 * @description update existing item using specified criteria
	 * @param {Object} criteria selector
	 * @param {Object} data updates
	 * @param  {Function} [done]  a callback to invoke on success or error
	 * @return {Query}            query instance
	 * @public
	 * @example
	 * query.findOneAndUpdate(conditions, update, callback) // executes
	 * query.findOneAndUpdate(conditions, update)           // returns Query
	 * query.findOneAndUpdate(update, callback)             // returns Query
	 * query.findOneAndUpdate(update)                       // returns Query
	 * query.findOneAndUpdate(callback)                     // executes
	 * query.findOneAndUpdate()                             // returns Query
	 */
	Query.prototype.findOneAndUpdate = function(criteria, data, done) {
		//jshint validthis:true
		var self = this;

		//normalize arguments
		if (criteria && _.isFunction(criteria)) {
			done = criteria;
			criteria = {};
		}

		//ensure limit
		if (criteria) {
			//ensure limit
			self.limit(1);
		}

		return self.update(criteria, data, done);
	};

}(this));