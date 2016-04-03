'use strict';

/**
 * @function
 * @description update existing item using its id
 * @param {String} id selector
 * @param {Object} data updates
 * @param  {Function} [done]  a callback to invoke on success or error
 * @return {Query}            query instance
 * @public
 */
Query.prototype.findByIdAndUpdate = function(id, data, done) {
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

	return self.update(criteria, data, done);
};