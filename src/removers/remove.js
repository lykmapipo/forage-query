'use strict';

/**
 * @description remove an item based on criteria provided
 * @param {Object} [criteria]  selector
 * @param  {Function} [done]   a callback to invoke on success or error
 * @return {Query}             query instance
 */
Query.prototype.remove = function(criteria, done) {
	// jshint validthis:true
	if (done) {
		//run query
	}

	return self;
};


/**
 * @function
 * @name _remove
 * @param  {Array<String>}   keys valid item keys
 * @param  {Function} done   a callback to invoke on success or error
 * @private
 */
Query.prototype._remove = function(keys, done) {
	//jshint validthis:true
	var self = this;

	//prepare removes
	self._removes = _.map(keys, function(key) {
		return self.localForage.removeItem(key);
	});

	//perform batch remove
	self._removes = self.Promise.all(data);

	if (done && _.isFunction(done)) {
		self._removes.then(function(results) {
			return done(null, results);
		}).catch(function(error) {
			return done(error);
		});
	}

	return self;
};