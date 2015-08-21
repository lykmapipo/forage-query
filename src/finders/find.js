'use strict';


/**
 * @description find an item using specified criteria
 * @param  {Function} done [description]
 * @return {[type]}            [description]
 */
Query.prototype.find = function(criteria, done) {
    /*jshint validthis:true*/
    var self = this;

    //tell what operation to perform
    self._operation = 'find';

    if (_.isFunction(criteria)) {
        done = criteria;
        criteria = undefined;
    }

    //build or merge criterias
    if (criteria) {
        self.where(criteria);
    }

    //execute query
    if (done && _.isFunction(done)) {
        //if there is id in condition clause
        //get item by its id
        if (self._conditions.id) {
            var id = self._conditions.id.value;
            self.localForage.getItem(id, function(error, value) {
                done(error, self._buildItem(id, value));
            });
        }

        //otherwise iterate through and
        //collect all values match filter
        var items = [];

        //iterate store and collect item(s) based on criteria
        self.localForage.iterate(function onItem(value, key /*, iterationNumber*/ ) {
            //filter item based on condition
            if (self._passFilter(key, value)) {
                //collect matched values
                items.push({
                    key: key,
                    value: value
                });
            }
        }, function(error) {
            if (error) {
                done(error);
            } else {

                //prepare result
                items = _.map(items, function(item) {
                    return self._buildItem(item.key, item.value);
                });

                //check for skip and limit
                if (self._skip && self._limit) {
                    items = _.slice(items, self._skip, self._limit);
                }

                if (self._limit && self._limit === 1) {
                    done(null, _.first(items));
                } else {
                    done(null, items);
                }
            }
        });

    }

    return self;
};


/**
 * @function
 * @description build an item from its key value
 * @param  {String|Integer} key id of the value stored
 * @param  {Mixed} value actual value store
 * @return {Object}       a combination of key and value
 * @private
 */
Query.prototype._buildItem = function(key, value) {
    if (_.isPlainObject(value)) {
        return _.extend(value, {
            id: key
        });
    } else {
        return {
            id: key,
            value: value
        };
    }
};


/**
 * @function
 * @description filter provided key,value pair based on current query condition
 * @param  {Mixed} key   a key/id of the value
 * @param  {Mixed} value a value to be filtered
 * @private
 */
Query.prototype._passFilter = function(key, value) {
    /*jshint validthis:true*/
    var self = this;

    var isMatched = false;

    //extend value with its id
    value = _.extend(value, {
        id: key
    });

    //clone conditions
    var conditions = _.clone(self._conditions);

    var paths = _.keys(conditions);

    //iterate over paths and apply
    //condition operation
    _.forEach(paths, function pathMatcher(path) {
        //obtain matcher
        var matcher = conditions[path];
        var _operation = matcher.operation;
        var _value = matcher.value;

        //obtaion value path
        var property = _.get(value, path);

        //invoke matcher oparation to compare property value 
        //and condition value
        var ok = _[_operation](property, _value);

        //TODO fix this
        isMatched = isMatched || ok;

    });

    return isMatched;
};