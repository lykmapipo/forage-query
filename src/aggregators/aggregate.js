(function(root, undefined) {

	'use strict';

	var Query = root.Query;

	/**
	 * @function
	 * @description 
	 * @param  {Object[]}   aggregation aggregation operator(s) or operator array
	 * @param  {Function} [done]        callback to invoke on success or error
	 * @return {Query}               this
	 * @public
	 */
	Query.prototype.aggregate = function(aggregation, done) {
		// jshint validthis:true
		var self = this;

		//tell what operation to perform
		self._operation = 'find';

		//normalize arguments
		if (aggregation && _.isFunction(aggregation)) {
			done = aggregation;
			aggregation = undefined;
		}

		//build where clause based on criteria
		if (aggregation) {
			aggregation = _.isArray(aggregation) ? aggregation : [aggregation];
			self._aggregation = aggregation;
		}

		if (done && _.isFunction(done)) {
			//execute find query
			return self.find(done);
		}

		return this;

	};

}(this));