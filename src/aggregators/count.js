(function(root, undefined) {

	'use strict';

	var Query = root.Query;

	/**
	 * @description count existing values based on criteria 
	 * @param  {Function} [done] a callback to invoke on suceess or error
	 * @return {Query}           query instance
	 * @public
	 * @see {@link https://docs.mongodb.org/manual/reference/method/db.collection.count/|count}
	 * @example
	 * var countQuery = model.where({ 'color': 'black' }).count();
	 *
	 * query.count({ color: 'black' }).exec(callback)
	 *
	 * query.count({ color: 'black' }, callback)
	 */
	Query.prototype.count = function(criteria, done) {
		// jshint validthis:true
		var self = this;

		//tell what operation to perform
		self._operation = 'count';

		//tell aggregation to perform
		self._aggregation = 'count';


		//normalize arguments
		if (criteria && _.isFunction(criteria)) {
			done = criteria;
			criteria = undefined;
		}

		//build where clause based on criteria
		if (criteria) {
			self.where(criteria);
		}

		if (done && _.isFunction(done)) {
			//if no criteria return keys length
			if (!self._hasConditions()) {
				self.localForage.length(function(error, count) {
					return done(error, count);
				});
			}

			//query based on criteria
			else {
				//execute find query
				return self.find(done);
			}

		}

		return this;

	};

}(this));