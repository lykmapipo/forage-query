(function(root, undefined) {

	'use strict';

	var Query = root.Query;


	/**
	 * @function
	 * @description specifies the number of documents to skip
	 * @param  {Integer} value a skip value
	 * @return {Query}       
	 * @public
	 * @see {@link http://docs.mongodb.org/manual/reference/method/cursor.skip/|cursor.skip}
	 * @example
	 * query.skip(100).limit(20)
	 */
	Query.prototype.skip = function(value) {
		/*jshint validthis:true*/
		var self = this;

		// tell what operation to perform
		self._operation = 'find';

		//set a skip condition
		self._skip = value || 0;

		//return self
		return self;
	};

}(this));