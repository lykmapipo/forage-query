(function(root, undefined) {

	'use strict';

	var Query = root.Query;
	/**
	 * @description update a given item(s) using specified criteria
	 * @param {Object} criteria selector
	 * @param {Object} data updates
	 * @param  {Function} [done]  a callback to invoke on success or error
	 * @return {Query}             query instance
	 */
	Query.prototype.update = function(criteria, data, done) {
		/*jshint validthis:true*/
		var self = this;

		//tell what operation to perform
		self._operation = 'update';

		//normalize arguments
		if (criteria && _.isFunction(criteria) && !self._updates) {
			done = criteria;
			criteria = {};
			data = {};
		}

		if (data && _.isFunction(data) && !self._updates) {
			done = data;
			data = {};
		}

		if (self._updates) {
			done = criteria;
		}

		//tell which data to update
		if (!self._updates) {
			self._data = data;
		}

		//find item(s) based on criteria
		if (!self._updates) {
			var query = new self.Query();
			self._updates = self.find.call(query, criteria);
		}

		//update items
		if (done && _.isFunction(done)) {
			self._updates.then(function(items) {
				//update _updates reference
				self._updates = items;

				//perfom update
				return self._update();
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
	 * @name _update
	 * @description update current items in query _updates queue(collection)
	 * @private
	 */
	Query.prototype._update = function() {
		/*jshint validthis:true*/
		var self = this;

		//prepare updates
		var updates = _.map([].concat(self._updates), function(item) {
			return _.merge({}, item, self._data);
		});

		//compact updates
		updates = _.compact(updates);

		//perform batch update
		var query = new self.Query();
		updates = query.create.call(query, updates);

		return updates.then(function(results) {
			//return updated items
			return (self._limit && self._limit === 1) ? _.first(results) : results;
		});
	};

}(this));