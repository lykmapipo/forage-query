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
    // if (criteria) {
    //     this._conditions = _.merge(this._conditions, criteria);
    // }

    //filter provided key,value pair based on current
    //query condition
    function matchConditions(key, value) {
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
            var property = value[path];

            var ok = _[_operation](property, _value);

            isMatched = isMatched || ok;

        });

        return isMatched;
    }

    //if conditions contains id return item with the specified id
    // function fetchById(key, value) {
    //     if (self._conditions.id && key === self._conditions.id) {
    //         if (_.isPlainObject(value)) {
    //             return _.extend(value, {
    //                 id: key
    //             });
    //         } else {
    //             return {
    //                 id: key,
    //                 value: value
    //             };
    //         }
    //     }
    // }

    //execute query
    if (done && _.isFunction(done)) {
        //collect all values match filter
        var items = [];
        //iterate store and collect item(s) based on criteria
        self.localForage.iterate(function onItem(value, key /*, iterationNumber*/ ) {
            //filter item based on condition
            if (matchConditions(key, value)) {
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
                    if (_.isPlainObject(item.value)) {
                        return _.extend(item.value, {
                            id: item.key
                        });
                    } else {
                        return {
                            id: item.key,
                            value: item.value
                        };
                    }
                });

                if (_.size(items) === 1) {
                    done(null, _.first(items));
                } else {
                    done(null, items);
                }
            }
        });

    }

    return self;
};