'use strict';

/**
 * @description remove an item based on criteria provided
 * @param {Object} [criteria]  selector
 * @param  {Function} [done]   a callback to invoke on success or error
 * @return {Query}             query instance
 */
Query.prototype.remove = function(criteria, done) {
	// jshint validthis:true
	var self = this;

	//normalize arguments
	if (criteria && _.isFunction(criteria)) {
		done = criteria;
		criteria = {};
	}

	//find items to remove
	self._removes = self.find(criteria);

	//remove items
	if (done && _.isFunction(done)) {
		self._removes.then(function(items) {
			//update _removes reference
			self._removes = items;

			//perfom remove
			return self._remove();
		}).then(function(items) {
			done(null, items);
		}).catch(function(error) {
			done(error);
		});
	}

	return self;
};


/**
 * @function
 * @name _remove
 * @description remove current items in query _removes queue(collection)
 * @private
 */
Query.prototype._remove = function() {
	//jshint validthis:true
	var self = this;

	//prepare removes
	var removes = _.map(self._removes, function(item) {
		return self.localForage.removeItem(item.id || item._id);
	});

	//perform batch remove
	removes = self.Promise.all(removes);

	return removes.then(function( /*results*/ ) {
		//return removed items
		return self._removes;
	});
};