(function(root, undefined) {

	'use strict';

	var Query = root.Query;

	//TODO implement options

	/**
	 * @function
	 * @description remove existing item using specified criteria
	 * @param  {Function} [done]  a callback to invoke on success or error
	 * @return {Query}            query instance
	 * @public
	 * @example
	 * A.where().findOneAndRemove(conditions, callback) // executes
	 * A.where().findOneAndRemove(conditions) // returns Query
	 * A.where().findOneAndRemove(callback)   // executes
	 * A.where().findOneAndRemove()           // returns Query
	 */
	Query.prototype.findOneAndRemove = function(criteria, done) {
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

		return self.remove(criteria, done);
	};

}(this));