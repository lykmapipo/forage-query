(function(root, undefined) {

	'use strict';

	var Query = root.Query;

	/**
	 * @function
	 * @description sets the sort order 
	 * @param {Object} criteria  sorting criteria
	 * @return {Query}           query instance
	 * @public
	 * @see {@link http://docs.mongodb.org/manual/reference/method/cursor.sort/|cursor.sort}
	 * @example
	 * query.sort({test: -1 });
	 */
	Query.prototype.sort = function(criteria) {
		// jshint validthis:true
		var self = this;

		//build where clause based on criteria
		if (criteria) {
			self._sort = _.merge({}, self._sort, criteria);
		}

		return this;
	};

}(this));