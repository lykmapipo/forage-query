(function(root, undefined) {

	'use strict';

	var Query = root.Query;

	/**
	 * @function
	 * @description remove existing item using its id
	 * @param  {Function} [done]  a callback to invoke on success or error
	 * @return {Query}            query instance
	 * @public
	 */
	Query.prototype.findByIdAndRemove = function(id, done) {
		//jshint validthis:true
		var self = this;

		//normalize arguments
		if (id && _.isFunction(id)) {
			done = id;
			id = undefined;
		}

		//prepare criteria
		var criteria;
		if (id) {
			//FIX Invalid expression for $or criteria in mingo
			criteria = {
				id: id
			};

			//ensure limit
			self.limit(1);
		}

		//throw no id
		else {
			throw new Error('Missing id');
		}

		return self.remove(criteria, done);
	};

}(this));