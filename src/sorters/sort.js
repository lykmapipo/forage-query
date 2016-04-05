(function(root, undefined) {

	'use strict';

	var Query = root.Query;

	/**
	 * @description sort query result based on criteria 
	 * @param {Object} criteria  sorting criteria
	 * @return {Query}           query instance
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