(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module unless amdModuleId is set
    define(["localforage","lodash","node-uuid"], function (a0,b1,c2) {
      return (factory(a0,b1,c2));
    });
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory(require("localforage"),require("lodash"),require("node-uuid"));
  } else {
    factory(localforage,_,uuid);
  }
}(this, function (localforage, _, uuid) {

/**
 * Query builder for localForage
 * @version v0.1.1 - Mon Apr 04 2016 22:31:34
 * @link https://github.com/lykmapipo/forage-query
 * @authors lykmapipo <lallyelias87@gmail.com>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */

// Mingo.js 0.6.3
// Copyright (c) 2015 Francis Asante <kofrasa@gmail.com>
// MIT

;
(function (root, undefined) {

  "use strict";

  // global on the server, window in the browser
  var Mingo = {}, previousMingo;
  var _;

  Mingo.VERSION = '0.6.3';

  // backup previous Mingo
  if (root != null) {
    previousMingo = root.Mingo;
  }

  Mingo.noConflict = function () {
    root.Mingo = previousMingo;
    return Mingo;
  };

  var nodeEnabled = ('undefined' !== typeof module && 'undefined' !== typeof require);

  // Export the Mingo object for Node.js
  if (nodeEnabled) {
    if (typeof module !== 'undefined') {
      module.exports = Mingo;
    }
    _ = require("lodash"); // get a reference to underscore
  } else {
    root.Mingo = Mingo;
    _ = root._; // get a reference to underscore
  }

  // quick reference for
  var primitives = [
    _.isString, _.isBoolean, _.isNumber, _.isDate, _.isNull, _.isRegExp
  ];

  function isPrimitive(value) {
    for (var i = 0; i < primitives.length; i++) {
      if (primitives[i](value)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Simplify expression for easy evaluation with query operators map
   * @param expr
   * @returns {*}
   */
  function normalize(expr) {

    // normalized primitives
    if (isPrimitive(expr)) {
      return _.isRegExp(expr) ? {"$regex": expr} : {"$eq": expr};
    }

    // normalize object expression
    if (_.isObject(expr)) {
      var keys = _.keys(expr);
      var notQuery = _.intersection(ops(OP_QUERY), keys).length === 0;

      // no valid query operator found, so we do simple comparison
      if (notQuery) {
        return {"$eq": expr};
      }

      // ensure valid regex
      if (_.contains(keys, "$regex")) {
        var regex = expr['$regex'];
        var options = expr['$options'] || "";
        var modifiers = "";
        if (_.isString(regex)) {
          modifiers += (regex.ignoreCase || options.indexOf("i") >= 0) ? "i" : "";
          modifiers += (regex.multiline || options.indexOf("m") >= 0) ? "m" : "";
          modifiers += (regex.global || options.indexOf("g") >= 0) ? "g" : "";
          regex = new RegExp(regex, modifiers);
        }
        expr['$regex'] = regex;
        delete expr['$options'];
      }
    }

    return expr;
  }

  // Settings used by Mingo internally
  var settings = {
    key: "_id"
  };

  /**
   * Setup default settings for Mingo
   * @param options
   */
  Mingo.setup = function (options) {
    _.extend(settings, options || {});
  };


  /**
   * Query object to test collection elements with
   * @param criteria the pass criteria for the query
   * @param projection optional projection specifiers
   * @constructor
   */
  Mingo.Query = function (criteria, projection) {
    if (!(this instanceof Mingo.Query))
      return new Mingo.Query(criteria, projection);

    this._criteria = criteria;
    this._projection = projection;
    this._compiled = [];
    this._compile();
  };

  Mingo.Query.prototype = {

    _compile: function () {

      if (_.isEmpty(this._criteria)) return;

      if (_.isArray(this._criteria) || _.isFunction(this._criteria) || !_.isObject(this._criteria)) {
        throw new Error("Invalid type for criteria");
      }

      for (var field in this._criteria) {
        if (this._criteria.hasOwnProperty(field)) {
          var expr = this._criteria[field];
          if (_.contains(['$and', '$or', '$nor', '$where'], field)) {
            this._processOperator(field, field, expr);
          } else {
            // normalize expression
            expr = normalize(expr);
            for (var op in expr) {
              if (expr.hasOwnProperty(op)) {
                this._processOperator(field, op, expr[op]);
              }
            }
          }
        }
      }
    },

    _processOperator: function (field, operator, value) {
      if (_.contains(ops(OP_QUERY), operator)) {
        this._compiled.push(queryOperators[operator](field, value));
      } else {
        throw new Error("Invalid query operator '" + operator + "' detected");
      }
    },

    /**
     * Checks if the object passes the query criteria. Returns true if so, false otherwise.
     * @param obj
     * @returns {boolean}
     */
    test: function (obj) {
      for (var i = 0; i < this._compiled.length; i++) {
        if (!this._compiled[i].test(obj)) {
          return false;
        }
      }
      return true;
    },

    /**
     * Performs a query on a collection and returns a cursor object.
     * @param collection
     * @param projection
     * @returns {Mingo.Cursor}
     */
    find: function (collection, projection) {
      return new Mingo.Cursor(collection, this, projection);
    },

    /**
     * Remove matched documents from the collection returning the remainder
     * @param collection
     * @returns {Array}
     */
    remove: function (collection) {
      var arr = [];
      for (var i = 0; i < collection.length; i++) {
        if (!this.test(collection[i])) {
          arr.push(collection[i]);
        }
      }
      return arr;
    }
  };

  if (nodeEnabled) {

    var Transform = require('stream').Transform;
    var util = require('util');

    Mingo.Query.prototype.stream = function (options) {
      return new Mingo.Stream(this, options);
    };

    /**
     * Create a Transform class
     * @param query
     * @param options
     * @returns {Mingo.Stream}
     * @constructor
     */
    Mingo.Stream = function (query, options) {

      if (!(this instanceof Mingo.Stream))
        return new Mingo.Stream(query, options);

      options = options || {};
      _.extend(options, {objectMode: true});
      Transform.call(this, options);
      // query for this stream
      this._query = query;
    };
    // extend Transform
    util.inherits(Mingo.Stream, Transform);

    Mingo.Stream.prototype._transform = function (chunk, encoding, done) {
      if (_.isObject(chunk) && this._query.test(chunk)) {
        if (_.isEmpty(this._query._projection)) {
          this.push(chunk);
        } else {
          var cursor = new Mingo.Cursor([chunk], this._query);
          if (cursor.hasNext()) {
            this.push(cursor.next());
          }
        }
      }
      done();
    };
  }

  /**
   * Cursor to iterate and perform filtering on matched objects
   * @param collection
   * @param query
   * @param projection
   * @constructor
   */
  Mingo.Cursor = function (collection, query, projection) {

    if (!(this instanceof Mingo.Cursor))
      return new Mingo.Cursor(collection, query, projection);

    this._query = query;
    this._collection = collection;
    this._projection = projection || query._projection;
    this._operators = {};
    this._result = false;
    this._position = 0;
  };

  Mingo.Cursor.prototype = {

    _fetch: function () {
      var self = this;

      if (this._result !== false) {
        return this._result;
      }

      // inject projection operator
      if (_.isObject(this._projection)) {
        _.extend(this._operators, {"$project": this._projection});
      }

      if (!_.isArray(this._collection)) {
        throw new Error("Input collection is not of valid type. Must be an Array.");
      }

      // filter collection
      this._result = _.filter(this._collection, this._query.test, this._query);
      var pipeline = [];

      _.each(['$sort', '$skip', '$limit', '$project'], function (op) {
        if (_.has(self._operators, op)) {
          pipeline.push(_.pick(self._operators, op));
        }
      });

      if (pipeline.length > 0) {
        var aggregator = new Mingo.Aggregator(pipeline);
        this._result = aggregator.run(this._result, this._query);
      }
      return this._result;
    },

    /**
     * Fetch and return all matched results
     * @returns {Array}
     */
    all: function () {
      return this._fetch();
    },

    /**
     * Fetch and return the first matching result
     * @returns {Object}
     */
    first: function () {
      return this.count() > 0 ? this._fetch()[0] : null;
    },

    /**
     * Fetch and return the last matching object from the result
     * @returns {Object}
     */
    last: function () {
      return this.count() > 0 ? this._fetch()[this.count() - 1] : null;
    },

    /**
     * Counts the number of matched objects found
     * @returns {Number}
     */
    count: function () {
      return this._fetch().length;
    },

    /**
     * Returns a cursor that begins returning results only after passing or skipping a number of documents.
     * @param {Number} n the number of results to skip.
     * @return {Mingo.Cursor} Returns the cursor, so you can chain this call.
     */
    skip: function (n) {
      _.extend(this._operators, {"$skip": n});
      return this;
    },

    /**
     * Constrains the size of a cursor's result set.
     * @param {Number} n the number of results to limit to.
     * @return {Mingo.Cursor} Returns the cursor, so you can chain this call.
     */
    limit: function (n) {
      _.extend(this._operators, {"$limit": n});
      return this;
    },

    /**
     * Returns results ordered according to a sort specification.
     * @param {Object} modifier an object of key and values specifying the sort order. 1 for ascending and -1 for descending
     * @return {Mingo.Cursor} Returns the cursor, so you can chain this call.
     */
    sort: function (modifier) {
      _.extend(this._operators, {"$sort": modifier});
      return this;
    },

    /**
     * Returns the next document in a cursor.
     * @returns {Object | Boolean}
     */
    next: function () {
      if (this.hasNext()) {
        return this._fetch()[this._position++];
      }
      return null;
    },

    /**
     * Returns true if the cursor has documents and can be iterated.
     * @returns {boolean}
     */
    hasNext: function () {
      return this.count() > this._position;
    },

    /**
     * Specifies the exclusive upper bound for a specific field
     * @param expr
     * @returns {Number}
     */
    max: function (expr) {
      return groupOperators.$max(this._fetch(), expr);
    },

    /**
     * Specifies the inclusive lower bound for a specific field
     * @param expr
     * @returns {Number}
     */
    min: function (expr) {
      return groupOperators.$min(this._fetch(), expr);
    },

    /**
     * Applies a function to each document in a cursor and collects the return values in an array.
     * @param callback
     * @returns {Array}
     */
    map: function (callback) {
      return _.map(this._fetch(), callback);
    },

    /**
     * Applies a JavaScript function for every document in a cursor.
     * @param callback
     */
    forEach: function (callback) {
      _.each(this._fetch(), callback);
    }

  };

  /**
   * Aggregator for defining filter using mongoDB aggregation pipeline syntax
   * @param operators an Array of pipeline operators
   * @constructor
   */
  Mingo.Aggregator = function (operators) {
    if (!(this instanceof Mingo.Aggregator))
      return new Mingo.Aggregator(operators);

    this._operators = operators;
  };

  Mingo.Aggregator.prototype = {

    /**
     * Apply the pipeline operations over the collection by order of the sequence added
     * @param collection an array of objects to process
     * @param query the `Mingo.Query` object to use as context
     * @returns {Array}
     */
    run: function (collection, query) {
      if (!_.isEmpty(this._operators)) {
        // run aggregation pipeline
        for (var i = 0; i < this._operators.length; i++) {
          var operator = this._operators[i];
          var key = _.keys(operator);
          if (key.length == 1 && _.contains(ops(OP_PIPELINE), key[0])) {
            key = key[0];
            if (query instanceof Mingo.Query) {
              collection = pipelineOperators[key].call(query, collection, operator[key]);
            } else {
              collection = pipelineOperators[key](collection, operator[key]);
            }
          } else {
            throw new Error("Invalid aggregation operator '" + key + "'");
          }
        }
      }
      return collection;
    }
  };

  /**
   * Retrieve the value of a given key on an object
   * @param obj
   * @param field
   * @returns {*}
   * @private
   */
  function getValue(obj, field) {
    return _.result(obj, field);
  }

  /**
   * Resolve the value of the field (dot separated) on the given object
   * @param obj
   * @param field
   * @returns {*}
   */
  function resolve(obj, field) {
    if (!field) {
      return undefined;
    }
    var names = field.split(".");
    var value = obj;
    var isText;

    for (var i = 0; i < names.length; i++) {
      isText = names[i].match(/^\d+$/) === null;

      if (isText && _.isArray(value)) {
        var res = [];
        _.each(value, function (item) {
          res.push(resolve(item, names[i]));
        });
        value = res;
      } else {
        value = getValue(value, names[i]);
      }

      if (value === undefined) {
        break;
      }
    }

    return value;
  }

  /**
   * Performs a query on a collection and returns a cursor object.
   * @param collection
   * @param criteria
   * @param projection
   * @returns {Mingo.Cursor}
   */
  Mingo.find = function (collection, criteria, projection) {
    return (new Mingo.Query(criteria)).find(collection, projection);
  };

  /**
   * Returns a new array without objects which match the criteria
   * @param collection
   * @param criteria
   * @returns {Array}
   */
  Mingo.remove = function (collection, criteria) {
    return (new Mingo.Query(criteria)).remove(collection);
  };

  /**
   * Return the result collection after running the aggregation pipeline for the given collection
   * @param collection
   * @param pipeline
   * @returns {Array}
   */
  Mingo.aggregate = function (collection, pipeline) {
    if (!_.isArray(pipeline)) {
      throw new Error("Aggregation pipeline must be an array");
    }
    return (new Mingo.Aggregator(pipeline)).run(collection);
  };

  /**
   * Add new operators
   * @param type the operator type to extend
   * @param f a function returning an object of new operators
   */
  Mingo.addOperators = function (type, f) {
    var newOperators = f({
      resolve: resolve,
      computeValue: computeValue,
      ops: ops,
      key: function () {
        return settings.key;
      }
    });

    // ensure correct type specified
    if (!_.contains([OP_AGGREGATE, OP_GROUP, OP_PIPELINE, OP_PROJECTION, OP_QUERY], type)) {
      throw new Error("Could not identify type '" + type + "'");
    }

    var operators = ops(type);

    // check for existing operators
    _.each(_.keys(newOperators), function (op) {
      if (!/^\$\w+$/.test(op)) {
        throw new Error("Invalid operator name '" + op + "'");
      }
      if (_.contains(operators, op)) {
        throw new Error("Operator " + op + " is already defined for " + type + " operators");
      }
    });

    var wrapped = {};

    switch (type) {
      case OP_QUERY:
        _.each(_.keys(newOperators), function (op) {
          wrapped[op] = (function (f, ctx) {
            return function (selector, value) {
              return {
                test: function (obj) {
                  // value of field must be fully resolved.
                  var lhs = resolve(obj, selector);
                  var result = f.call(ctx, selector, lhs, value);
                  if (_.isBoolean(result)) {
                    return result;
                  } else if (result instanceof Mingo.Query) {
                    return result.test(obj);
                  } else {
                    throw new Error("Invalid return type for '" + op + "'. Must return a Boolean or Mingo.Query");
                  }
                }
              };
            }
          }(newOperators[op], newOperators));
        });
        break;
      case OP_PROJECTION:
        _.each(_.keys(newOperators), function (op) {
          wrapped[op] = (function (f, ctx) {
            return function (obj, expr, selector) {
              var lhs = resolve(obj, selector);
              return f.call(ctx, selector, lhs, expr);
            }
          }(newOperators[op], newOperators));
        });
        break;
      default:
        _.each(_.keys(newOperators), function (op) {
          wrapped[op] = (function (f, ctx) {
            return function () {
              var args = Array.prototype.slice.call(arguments);
              return f.apply(ctx, args);
            }
          }(newOperators[op], newOperators));
        });
    }

    // toss the operator salad :)
    _.extend(OPERATORS[type], wrapped);

  };

  /**
   * Mixin for Backbone.Collection objects
   */
  Mingo.CollectionMixin = {
    /**
     * Runs a query and returns a cursor to the result
     * @param criteria
     * @param projection
     * @returns {Mingo.Cursor}
     */
    query: function (criteria, projection) {
      return Mingo.find(this.toJSON(), criteria, projection);
    },

    /**
     * Runs the given aggregation operators on this collection
     * @params pipeline
     * @returns {Array}
     */
    aggregate: function (pipeline) {
      var args = [this.toJSON(), pipeline];
      return Mingo.aggregate.apply(null, args);
    }
  };

  var pipelineOperators = {

    /**
     * Groups documents together for the purpose of calculating aggregate values based on a collection of documents.
     *
     * @param collection
     * @param expr
     * @returns {Array}
     */
    $group: function (collection, expr) {
      // lookup key for grouping
      var idKey = expr[settings.key];

      var partitions = groupBy(collection, function (obj) {
        return computeValue(obj, idKey, idKey);
      });

      var result = [];

      // remove the group key
      expr = _.omit(expr, settings.key);

      _.each(partitions.keys, function (value, i) {
        var obj = {};

        // exclude undefined key value
        if (!_.isUndefined(value)) {
          obj[settings.key] = value;
        }

        // compute remaining keys in expression
        for (var key in expr) {
          if (expr.hasOwnProperty(key)) {
            obj[key] = accumulate(partitions.groups[i], key, expr[key]);
          }
        }
        result.push(obj);
      });

      return result;
    },

    /**
     * Filters the document stream, and only allows matching documents to pass into the next pipeline stage.
     * $match uses standard MongoDB queries.
     *
     * @param collection
     * @param expr
     * @returns {Array|*}
     */
    $match: function (collection, expr) {
      return (new Mingo.Query(expr)).find(collection).all();
    },

    /**
     * Reshapes a document stream.
     * $project can rename, add, or remove fields as well as create computed values and sub-documents.
     *
     * @param collection
     * @param expr
     * @returns {Array}
     */
    $project: function (collection, expr) {

      if (_.isEmpty(expr)) {
        return collection;
      }

      // result collection
      var projected = [];
      var objKeys = _.keys(expr);
      var idOnlyExcludedExpression = false;

      if (_.contains(objKeys, settings.key)) {
        var id = expr[settings.key];
        if (id === 0 || id === false) {
          objKeys = _.without(objKeys, settings.key);
          if (_.isEmpty(objKeys)) {
            idOnlyExcludedExpression = true;
          }
        }
      } else {
        // if not specified the add the ID field
        objKeys.push(settings.key);
      }

      for (var i = 0; i < collection.length; i++) {

        var obj = collection[i];
        var cloneObj = {};
        var foundSlice = false;
        var foundExclusion = false;
        var dropKeys = [];

        if (idOnlyExcludedExpression) {
          dropKeys.push(settings.key);
        }

        _.each(objKeys, function (key) {

          var subExpr = expr[key];
          var newValue;
          if (key !== settings.key && subExpr === 0) {
            foundExclusion = true;
          }

          // tiny optimization here to skip over id
          if (key === settings.key && _.isEmpty(subExpr)) {
            newValue = obj[key];
          } else if (_.isString(subExpr)) {
            newValue = computeValue(obj, subExpr, key);
          } else if (subExpr === 1 || subExpr === true) {
            newValue = _.result(obj, key);
          } else if (_.isObject(subExpr)) {
            var operator = _.keys(subExpr);
            operator = operator.length > 1 ? false : operator[0];
            if (operator !== false && _.contains(ops(OP_PROJECTION), operator)) {
              // apply the projection operator on the operator expression for the key
              var temp = projectionOperators[operator](obj, subExpr[operator], key);
              if (!_.isUndefined(temp)) {
                newValue = temp;
              }
              if (operator == '$slice') {
                foundSlice = true;
              }
            } else {
              // compute the value for the sub expression for the key
              newValue = computeValue(obj, subExpr, key);
            }
          } else {
            dropKeys.push(key);
          }

          if (!_.isUndefined(newValue)) {
            cloneObj[key] = newValue;
          }
        });
        // if projection included $slice operator
        // Also if exclusion fields are found or we want to exclude only the id field
        // include keys that were not explicitly excluded
        if (foundSlice || foundExclusion || idOnlyExcludedExpression) {
          cloneObj = _.defaults(cloneObj, _.omit(obj, dropKeys));
        }
        projected.push(cloneObj);
      }

      return projected;
    },

    /**
     * Restricts the number of documents in an aggregation pipeline.
     *
     * @param collection
     * @param value
     * @returns {Object|*}
     */
    $limit: function (collection, value) {
      return _.first(collection, value);
    },

    /**
     * Skips over a specified number of documents from the pipeline and returns the rest.
     *
     * @param collection
     * @param value
     * @returns {*}
     */
    $skip: function (collection, value) {
      return _.rest(collection, value);
    },

    /**
     * Takes an array of documents and returns them as a stream of documents.
     *
     * @param collection
     * @param expr
     * @returns {Array}
     */
    $unwind: function (collection, expr) {
      var result = [];
      var field = expr.substr(1);
      for (var i = 0; i < collection.length; i++) {
        var obj = collection[i];
        // must throw an error if value is not an array
        var value = getValue(obj, field);
        if (_.isArray(value)) {
          _.each(value, function (item) {
            var tmp = _.clone(obj);
            tmp[field] = item;
            result.push(tmp);
          });
        } else {
          throw new Error("Target field '" + field + "' is not of type Array.");
        }
      }
      return result;
    },

    /**
     * Takes all input documents and returns them in a stream of sorted documents.
     *
     * @param collection
     * @param sortKeys
     * @returns {*}
     */
    $sort: function (collection, sortKeys) {
      if (!_.isEmpty(sortKeys) && _.isObject(sortKeys)) {
        var modifiers = _.keys(sortKeys);
        modifiers.reverse().forEach(function (key) {
          var indexes = [];
          var grouped = _.groupBy(collection, function (obj) {
            var value = resolve(obj, key);
            indexes.push(value);
            return value;
          });
          indexes = _.sortBy(_.uniq(indexes), function (item) {
            return item;
          });
          if (sortKeys[key] === -1) {
            indexes.reverse();
          }
          collection = [];
          _.each(indexes, function (item) {
            Array.prototype.push.apply(collection, grouped[item]);
          });
        });
      }
      return collection;
    }
  };

  ////////// QUERY OPERATORS //////////
  var queryOperators = {};

  var compoundOperators = {

    /**
     * Joins query clauses with a logical AND returns all documents that match the conditions of both clauses.
     *
     * @param selector
     * @param value
     * @returns {{test: Function}}
     */
    $and: function (selector, value) {
      if (!_.isArray(value)) {
        throw new Error("Invalid expression for $and criteria");
      }
      var queries = [];
      _.each(value, function (expr) {
        queries.push(new Mingo.Query(expr));
      });

      return {
        test: function (obj) {
          for (var i = 0; i < queries.length; i++) {
            if (!queries[i].test(obj)) {
              return false;
            }
          }
          return true;
        }
      };
    },

    /**
     * Joins query clauses with a logical OR returns all documents that match the conditions of either clause.
     *
     * @param selector
     * @param value
     * @returns {{test: Function}}
     */
    $or: function (selector, value) {
      if (!_.isArray(value)) {
        throw new Error("Invalid expression for $or criteria");
      }
      var queries = [];
      _.each(value, function (expr) {
        queries.push(new Mingo.Query(expr));
      });

      return {
        test: function (obj) {
          for (var i = 0; i < queries.length; i++) {
            if (queries[i].test(obj)) {
              return true;
            }
          }
          return false;
        }
      };
    },

    /**
     * Joins query clauses with a logical NOR returns all documents that fail to match both clauses.
     *
     * @param selector
     * @param value
     * @returns {{test: Function}}
     */
    $nor: function (selector, value) {
      if (!_.isArray(value)) {
        throw new Error("Invalid expression for $nor criteria");
      }
      var query = this.$or("$or", value);
      return {
        test: function (obj) {
          return !query.test(obj);
        }
      };
    },

    /**
     * Inverts the effect of a query expression and returns documents that do not match the query expression.
     *
     * @param selector
     * @param value
     * @returns {{test: Function}}
     */
    $not: function (selector, value) {
      var criteria = {};
      criteria[selector] = normalize(value);
      var query = new Mingo.Query(criteria);
      return {
        test: function (obj) {
          return !query.test(obj);
        }
      };
    },

    /**
     * Matches documents that satisfy a JavaScript expression.
     *
     * @param selector
     * @param value
     * @returns {{test: test}}
     */
    $where: function (selector, value) {
      if (!_.isFunction(value)) {
        value = new Function("return " + value + ";");
      }
      return {
        test: function (obj) {
          return value.call(obj) === true;
        }
      };
    }

  };

  // add compound query operators
  _.extend(queryOperators, compoundOperators);

  var simpleOperators = {

    /**
     * Checks that two values are equal. Pseudo operator introduced for convenience and consistency
     *
     * @param a
     * @param b
     * @returns {*}
     */
    $eq: function (a, b) {
      // flatten to reach nested values. fix for https://github.com/kofrasa/mingo/issues/19
      a = _.flatten(_.isArray(a) ? a : [a]);
      a = _.find(a, function (val) {
        return _.isEqual(val, b);
      });
      return a !== undefined;
    },

    /**
     * Matches all values that are not equal to the value specified in the query.
     *
     * @param a
     * @param b
     * @returns {boolean}
     */
    $ne: function (a, b) {
      return !this.$eq(a, b);
    },

    /**
     * Matches any of the values that exist in an array specified in the query.
     *
     * @param a
     * @param b
     * @returns {*}
     */
    $in: function (a, b) {
      a = _.isArray(a) ? a : [a];
      return _.intersection(a, b).length > 0;
    },

    /**
     * Matches values that do not exist in an array specified to the query.
     *
     * @param a
     * @param b
     * @returns {*|boolean}
     */
    $nin: function (a, b) {
      return _.isUndefined(a) || !this.$in(a, b);
    },

    /**
     * Matches values that are less than the value specified in the query.
     *
     * @param a
     * @param b
     * @returns {boolean}
     */
    $lt: function (a, b) {
      a = _.isArray(a) ? a : [a];
      a = _.find(a, function (val) {
        return val < b
      });
      return a !== undefined;
    },

    /**
     * Matches values that are less than or equal to the value specified in the query.
     *
     * @param a
     * @param b
     * @returns {boolean}
     */
    $lte: function (a, b) {
      a = _.isArray(a) ? a : [a];
      a = _.find(a, function (val) {
        return val <= b
      });
      return a !== undefined;
    },

    /**
     * Matches values that are greater than the value specified in the query.
     *
     * @param a
     * @param b
     * @returns {boolean}
     */
    $gt: function (a, b) {
      a = _.isArray(a) ? a : [a];
      a = _.find(a, function (val) {
        return val > b
      });
      return a !== undefined;
    },

    /**
     * Matches values that are greater than or equal to the value specified in the query.
     *
     * @param a
     * @param b
     * @returns {boolean}
     */
    $gte: function (a, b) {
      a = _.isArray(a) ? a : [a];
      a = _.find(a, function (val) {
        return val >= b
      });
      return a !== undefined;
    },

    /**
     * Performs a modulo operation on the value of a field and selects documents with a specified result.
     *
     * @param a
     * @param b
     * @returns {*|boolean|boolean}
     */
    $mod: function (a, b) {
      a = _.isArray(a) ? a : [a];
      a = _.find(a, function (val) {
        return _.isNumber(val) && _.isArray(b) && b.length === 2 && (val % b[0]) === b[1];
      });
      return a !== undefined;
    },

    /**
     * Selects documents where values match a specified regular expression.
     *
     * @param a
     * @param b
     * @returns {*|boolean}
     */
    $regex: function (a, b) {
      a = _.isArray(a) ? a : [a];
      a = _.find(a, function (val) {
        return _.isString(val) && _.isRegExp(b) && (!!val.match(b));
      });
      return a !== undefined;
    },

    /**
     * Matches documents that have the specified field.
     *
     * @param a
     * @param b
     * @returns {boolean|*|boolean}
     */
    $exists: function (a, b) {
      return (b === false && _.isUndefined(a)) || (b === true && !_.isUndefined(a));
    },

    /**
     * Matches arrays that contain all elements specified in the query.
     *
     * @param a
     * @param b
     * @returns boolean
     */
    $all: function (a, b) {
      var self = this;
      var matched = false;
      if (_.isArray(a) && _.isArray(b)) {
        for (var i = 0; i < b.length; i++) {
          if (_.isObject(b[i]) && _.contains(_.keys(b[i]), "$elemMatch")) {
            matched = matched || self.$elemMatch(a, b[i].$elemMatch);
          } else {
            // order of arguments matter. underscore maintains order after intersection
            return _.intersection(b, a).length === b.length;
          }
        }
      }
      return matched;
    },

    /**
     * Selects documents if the array field is a specified size.
     *
     * @param a
     * @param b
     * @returns {*|boolean}
     */
    $size: function (a, b) {
      return _.isArray(a) && _.isNumber(b) && (a.length === b);
    },

    /**
     * Selects documents if element in the array field matches all the specified $elemMatch condition.
     *
     * @param a
     * @param b
     */
    $elemMatch: function (a, b) {
      if (_.isArray(a) && !_.isEmpty(a)) {
        var query = new Mingo.Query(b);
        for (var i = 0; i < a.length; i++) {
          if (query.test(a[i])) {
            return true;
          }
        }
      }
      return false;
    },

    /**
     * Selects documents if a field is of the specified type.
     *
     * @param a
     * @param b
     * @returns {boolean}
     */
    $type: function (a, b) {
      switch (b) {
        case 1:
          return _.isNumeric(a) && (a + "").indexOf(".") !== -1;
        case 2:
        case 5:
          return _.isString(a);
        case 3:
          return _.isObject(a);
        case 4:
          return _.isArray(a);
        case 8:
          return _.isBoolean(a);
        case 9:
          return _.isDate(a);
        case 10:
          return _.isNull(a);
        case 11:
          return _.isRegExp(a);
        case 16:
          return _.isNumeric(a) && a <= 2147483647 && (a + "").indexOf(".") === -1;
        case 18:
          return _.isNumeric(a) && a > 2147483647 && a <= 9223372036854775807 && (a + "").indexOf(".") === -1;
        default:
          return false;
      }
    }
  };
  // add simple query operators
  _.each(_.keys(simpleOperators), function (op) {
    queryOperators[op] = (function (f, ctx) {
      return function (selector, value) {
        return {
          test: function (obj) {
            // value of field must be fully resolved.
            var lhs = resolve(obj, selector);
            return f.call(ctx, lhs, value);
          }
        };
      }
    }(simpleOperators[op], simpleOperators));
  });

  var projectionOperators = {

    /**
     * Projects the first element in an array that matches the query condition.
     *
     * @param obj
     * @param field
     * @param expr
     */
    $: function (obj, expr, field) {
      throw new Error("$ not implemented");
    },

    /**
     * Projects only the first element from an array that matches the specified $elemMatch condition.
     *
     * @param obj
     * @param field
     * @param expr
     * @returns {*}
     */
    $elemMatch: function (obj, expr, field) {
      var array = resolve(obj, field);
      var query = new Mingo.Query(expr);

      if (_.isUndefined(array) || !_.isArray(array)) {
        return undefined;
      }

      for (var i = 0; i < array.length; i++) {
        if (query.test(array[i])) {
          return [array[i]];
        }
      }

      return undefined;
    },

    /**
     * Limits the number of elements projected from an array. Supports skip and limit slices.
     *
     * @param obj
     * @param field
     * @param expr
     */
    $slice: function (obj, expr, field) {
      var array = resolve(obj, field);

      if (!_.isArray(array)) {
        return array;
      }
      if (!_.isArray(expr)) {
        if (!_.isNumber(expr)) {
          throw new Error("Invalid type for $slice operator");
        }
        expr = expr < 0 ? [expr] : [0, expr];
      } else {
        // MongoDB $slice works a bit differently from Array.slice
        // Uses single argument for 'limit' and array argument [skip, limit]
        var skip = (expr[0] < 0) ? array.length + expr[0] : expr;
        var limit = skip + expr[1];
        expr = [skip, limit];
      }

      return Array.prototype.slice.apply(array, expr);
    }
  };

  var groupOperators = {

    /**
     * Returns an array of all the unique values for the selected field among for each document in that group.
     *
     * @param collection
     * @param expr
     * @returns {*}
     */
    $addToSet: function (collection, expr) {
      var result = _.map(collection, function (obj) {
        return computeValue(obj, expr, null);
      });
      return _.uniq(result);
    },

    /**
     * Returns the sum of all the values in a group.
     *
     * @param collection
     * @param expr
     * @returns {*}
     */
    $sum: function (collection, expr) {
      if (!_.isArray(collection)) {
        return 0;
      }
      if (_.isNumber(expr)) {
        // take a short cut if expr is number literal
        return collection.length * expr;
      }
      return _.reduce(collection, function (acc, obj) {
        // pass empty field to avoid naming conflicts with fields on documents
        var n = computeValue(obj, expr, null);
        return _.isNumber(n)? acc + n : acc;
      }, 0);
    },
  
    /**
     * Returns the highest value in a group.
     *
     * @param collection
     * @param expr
     * @returns {*}
     */
    $max: function (collection, expr) {
      var obj = _.max(collection, function (obj) {
          return computeValue(obj, expr, null); 
      });
      return computeValue(obj, expr, null);
    },

    /**
     * Returns the lowest value in a group.
     *
     * @param collection
     * @param expr
     * @returns {*}
     */
    $min: function (collection, expr) {
      var obj = _.min(collection, function (obj) {
        return computeValue(obj, expr, null);
      });
      return computeValue(obj, expr, null);
    },

    /**
     * Returns an average of all the values in a group.
     *
     * @param collection
     * @param expr
     * @returns {number}
     */
    $avg: function (collection, expr) {
      return this.$sum(collection, expr) / (collection.length || 1);
    },

    /**
     * Returns an array of all values for the selected field among for each document in that group.
     *
     * @param collection
     * @param expr
     * @returns {Array|*}
     */
    $push: function (collection, expr) {
      return _.map(collection, function (obj) {
        return computeValue(obj, expr, null);
      });
    },

    /**
     * Returns the first value in a group.
     *
     * @param collection
     * @param expr
     * @returns {*}
     */
    $first: function (collection, expr) {
      return (collection.length > 0) ? computeValue(collection[0], expr) : undefined;
    },

    /**
     * Returns the last value in a group.
     *
     * @param collection
     * @param expr
     * @returns {*}
     */
    $last: function (collection, expr) {
      return (collection.length > 0) ? computeValue(collection[collection.length - 1], expr) : undefined;
    }
  };


  /////////// Aggregation Operators ///////////

  var arithmeticOperators = {

    /**
     * Computes the sum of an array of numbers.
     *
     * @param obj
     * @param expr
     * @returns {Object}
     */
    $add: function (obj, expr) {
      var args = computeValue(obj, expr, null);
      return _.reduce(args, function (memo, num) {
        return memo + num;
      }, 0);
    },

    /**
     * Takes an array that contains two numbers or two dates and subtracts the second value from the first.
     *
     * @param obj
     * @param expr
     * @returns {number}
     */
    $subtract: function (obj, expr) {
      var args = computeValue(obj, expr, null);
      return args[0] - args[1];
    },

    /**
     * Takes two numbers and divides the first number by the second.
     *
     * @param obj
     * @param expr
     * @returns {number}
     */
    $divide: function (obj, expr) {
      var args = computeValue(obj, expr, null);
      return args[0] / args[1];
    },

    /**
     * Computes the product of an array of numbers.
     *
     * @param obj
     * @param expr
     * @returns {Object}
     */
    $multiply: function (obj, expr) {
      var args = computeValue(obj, expr, null);
      return _.reduce(args, function (memo, num) {
        return memo * num;
      }, 1);
    },

    /**
     * Takes two numbers and calculates the modulo of the first number divided by the second.
     *
     * @param obj
     * @param expr
     * @returns {number}
     */
    $mod: function (obj, expr) {
      var args = computeValue(obj, expr, null);
      return args[0] % args[1];
    }
  };

  var stringOperators = {

    /**
     * Concatenates two strings.
     *
     * @param obj
     * @param expr
     * @returns {string|*}
     */
    $concat: function (obj, expr) {
      var args = computeValue(obj, expr, null);
      // does not allow concatenation with nulls
      if (_.contains(args, null) || _.contains(args, undefined)) {
        return null;
      }
      return args.join("");
    },

    /**
     * Compares two strings and returns an integer that reflects the comparison.
     *
     * @param obj
     * @param expr
     * @returns {number}
     */
    $strcasecmp: function (obj, expr) {
      var args = computeValue(obj, expr, null);
      args[0] = _.isEmpty(args[0]) ? "" : args[0].toUpperCase();
      args[1] = _.isEmpty(args[1]) ? "" : args[1].toUpperCase();
      if (args[0] > args[1]) {
        return 1;
      }
      return (args[0] < args[1]) ? -1 : 0;
    },

    /**
     * Returns a substring of a string, starting at a specified index position and including the specified number of characters.
     * The index is zero-based.
     *
     * @param obj
     * @param expr
     * @returns {string}
     */
    $substr: function (obj, expr) {
      var args = computeValue(obj, expr, null);
      if (_.isString(args[0])) {
        if (args[1] < 0) {
          return "";
        } else if (args[2] < 0) {
          return args[0].substr(args[1]);
        } else {
          return args[0].substr(args[1], args[2]);
        }
      }
      return "";
    },

    /**
     * Converts a string to lowercase.
     *
     * @param obj
     * @param expr
     * @returns {string}
     */
    $toLower: function (obj, expr) {
      var value = computeValue(obj, expr, null);
      return _.isEmpty(value) ? "" : value.toLowerCase();
    },

    /**
     * Converts a string to uppercase.
     *
     * @param obj
     * @param expr
     * @returns {string}
     */
    $toUpper: function (obj, expr) {
      var value = computeValue(obj, expr, null);
      return _.isEmpty(value) ? "" : value.toUpperCase();
    }
  };

  var dateOperators = {
    /**
     * Returns the day of the year for a date as a number between 1 and 366 (leap year).
     * @param obj
     * @param expr
     */
    $dayOfYear: function (obj, expr) {
      var d = computeValue(obj, expr, null);
      if (_.isDate(d)) {
        var start = new Date(d.getFullYear(), 0, 0);
        var diff = d - start;
        var oneDay = 1000 * 60 * 60 * 24;
        return Math.round(diff / oneDay);
      }
      return undefined;
    },

    /**
     * Returns the day of the month for a date as a number between 1 and 31.
     * @param obj
     * @param expr
     */
    $dayOfMonth: function (obj, expr) {
      var d = computeValue(obj, expr, null);
      return _.isDate(d) ? d.getDate() : undefined;
    },

    /**
     * Returns the day of the week for a date as a number between 1 (Sunday) and 7 (Saturday).
     * @param obj
     * @param expr
     */
    $dayOfWeek: function (obj, expr) {
      var d = computeValue(obj, expr, null);
      return _.isDate(d) ? d.getDay() + 1 : undefined;
    },

    /**
     * Returns the year for a date as a number (e.g. 2014).
     * @param obj
     * @param expr
     */
    $year: function (obj, expr) {
      var d = computeValue(obj, expr, null);
      return _.isDate(d) ? d.getFullYear() : undefined;
    },

    /**
     * Returns the month for a date as a number between 1 (January) and 12 (December).
     * @param obj
     * @param expr
     */
    $month: function (obj, expr) {
      var d = computeValue(obj, expr, null);
      return _.isDate(d) ? d.getMonth() + 1 : undefined;
    },

    /**
     * Returns the week number for a date as a number between 0
     * (the partial week that precedes the first Sunday of the year) and 53 (leap year).
     * @param obj
     * @param expr
     */
    $week: function (obj, expr) {
      // source: http://stackoverflow.com/a/6117889/1370481
      var d = computeValue(obj, expr, null);

      // Copy date so don't modify original
      d = new Date(+d);
      d.setHours(0, 0, 0);
      // Set to nearest Thursday: current date + 4 - current day number
      // Make Sunday's day number 7
      d.setDate(d.getDate() + 4 - (d.getDay() || 7));
      // Get first day of year
      var yearStart = new Date(d.getFullYear(), 0, 1);
      // Calculate full weeks to nearest Thursday
      return Math.floor(( ( (d - yearStart) / 8.64e7) + 1) / 7);
    },

    /**
     * Returns the hour for a date as a number between 0 and 23.
     * @param obj
     * @param expr
     */
    $hour: function (obj, expr) {
      var d = computeValue(obj, expr, null);
      return _.isDate(d) ? d.getHours() : undefined;
    },

    /**
     * Returns the minute for a date as a number between 0 and 59.
     * @param obj
     * @param expr
     */
    $minute: function (obj, expr) {
      var d = computeValue(obj, expr, null);
      return _.isDate(d) ? d.getMinutes() : undefined;
    },

    /**
     * Returns the seconds for a date as a number between 0 and 60 (leap seconds).
     * @param obj
     * @param expr
     */
    $second: function (obj, expr) {
      var d = computeValue(obj, expr, null);
      return _.isDate(d) ? d.getSeconds() : undefined;
    },

    /**
     * Returns the milliseconds of a date as a number between 0 and 999.
     * @param obj
     * @param expr
     */
    $millisecond: function (obj, expr) {
      var d = computeValue(obj, expr, null);
      return _.isDate(d) ? d.getMilliseconds() : undefined;
    },

    /**
     * Returns the date as a formatted string.
     *
     * %Y  Year (4 digits, zero padded)  0000-9999
     * %m  Month (2 digits, zero padded)  01-12
     * %d  Day of Month (2 digits, zero padded)  01-31
     * %H  Hour (2 digits, zero padded, 24-hour clock)  00-23
     * %M  Minute (2 digits, zero padded)  00-59
     * %S  Second (2 digits, zero padded)  00-60
     * %L  Millisecond (3 digits, zero padded)  000-999
     * %j  Day of year (3 digits, zero padded)  001-366
     * %w  Day of week (1-Sunday, 7-Saturday)  1-7
     * %U  Week of year (2 digits, zero padded)  00-53
     * %%  Percent Character as a Literal  %
     *
     * @param obj current object
     * @param expr operator expression
     */
    $dateToString: function (obj, expr) {

      var fmt = expr['format'];
      var date = computeValue(obj, expr['date'], null);
      var matches = fmt.match(/(%%|%Y|%m|%d|%H|%M|%S|%L|%j|%w|%U)/g);

      for (var i = 0, len = matches.length; i < len; i++) {
        var hdlr = DATE_SYM_TABLE[matches[i]];
        var value = hdlr;

        if (_.isArray(hdlr)) {
          // reuse date operators
          var fn = this[hdlr[0]];
          var pad = hdlr[1];
          value = padDigits(fn.call(this, obj, date), pad);
        }
        // replace the match with resolved value
        fmt = fmt.replace(matches[i], value);
      }

      return fmt;
    }
  };

  var setOperators = {
    /**
     * Returns true if two sets have the same elements.
     * @param obj
     * @param expr
     */
    $setEquals: function (obj, expr) {
      var args = computeValue(obj, expr, null);
      var first = _.uniq(args[0]);
      var second = _.uniq(args[1]);
      if (first.length !== second.length) {
        return false;
      }
      return _.difference(first, second).length == 0;
    },

    /**
     * Returns the common elements of the input sets.
     * @param obj
     * @param expr
     */
    $setIntersection: function (obj, expr) {
      var args = computeValue(obj, expr, null);
      return _.intersection(args[0], args[1]);
    },

    /**
     * Returns elements of a set that do not appear in a second set.
     * @param obj
     * @param expr
     */
    $setDifference: function (obj, expr) {
      var args = computeValue(obj, expr, null);
      return _.difference(args[0], args[1]);
    },

    /**
     * Returns a set that holds all elements of the input sets.
     * @param obj
     * @param expr
     */
    $setUnion: function (obj, expr) {
      var args = computeValue(obj, expr, null);
      return _.union(args[0], args[1]);
    },

    /**
     * Returns true if all elements of a set appear in a second set.
     * @param obj
     * @param expr
     */
    $setIsSubset: function (obj, expr) {
      var args = computeValue(obj, expr, null);
      return _.intersection(args[0], args[1]).length === args[0].length;
    },

    /**
     * Returns true if any elements of a set evaluate to true, and false otherwise.
     * @param obj
     * @param expr
     */
    $anyElementTrue: function (obj, expr) {
      // mongodb nests the array expression in another
      var args = computeValue(obj, expr, null)[0];
      for (var i = 0; i < args.length; i++) {
        if (!!args[i])
          return true;
      }
      return false;
    },

    /**
     * Returns true if all elements of a set evaluate to true, and false otherwise.
     * @param obj
     * @param expr
     */
    $allElementsTrue: function (obj, expr) {
      // mongodb nests the array expression in another
      var args = computeValue(obj, expr, null)[0];
      for (var i = 0; i < args.length; i++) {
        if (!args[i])
          return false;
      }
      return true;
    }
  };

  var conditionalOperators = {

    /**
     * A ternary operator that evaluates one expression,
     * and depending on the result returns the value of one following expressions.
     *
     * @param obj
     * @param expr
     */
    $cond: function (obj, expr) {
      var ifExpr, thenExpr, elseExpr;
      if (_.isArray(expr)) {
        if (expr.length != 3) {
          throw new Error("Invalid arguments for $cond operator");
        }
        ifExpr = expr[0];
        thenExpr = expr[1];
        elseExpr = expr[2];
      } else if (_.isObject(expr)) {
        ifExpr = expr['if'];
        thenExpr = expr['then'];
        elseExpr = expr['else'];
      }
      var condition = computeValue(obj, ifExpr, null);
      return condition ? computeValue(obj, thenExpr, null) : computeValue(obj, elseExpr, null);
    },

    /**
     * Evaluates an expression and returns the first expression if it evaluates to a non-null value.
     * Otherwise, $ifNull returns the second expression's value.
     *
     * @param obj
     * @param expr
     * @returns {*}
     */
    $ifNull: function (obj, expr) {
      if (!_.isArray(expr) || expr.length != 2) {
        throw new Error("Invalid arguments for $ifNull operator");
      }
      var args = computeValue(obj, expr, null);
      return (args[0] === null || args[0] === undefined) ? args[1] : args[0];
    }
  };

  var comparisonOperators = {
    /**
     * Compares two values and returns the result of the comparison as an integer.
     *
     * @param obj
     * @param expr
     * @returns {number}
     */
    $cmp: function (obj, expr) {
      var args = computeValue(obj, expr, null);
      if (args[0] > args[1]) {
        return 1;
      }
      return (args[0] < args[1]) ? -1 : 0;
    }
  };
  // mixin comparison operators
  _.each(["$eq", "$ne", "$gt", "$gte", "$lt", "$lte"], function (op) {
    comparisonOperators[op] = function (obj, expr) {
      var args = computeValue(obj, expr, null);
      return simpleOperators[op](args[0], args[1]);
    };
  });

  var arrayOperators = {
    /**
     * Counts and returns the total the number of items in an array.
     * @param obj
     * @param expr
     */
    $size: function (obj, expr) {
      var value = computeValue(obj, expr, null);
      return _.isArray(value) ? value.length : undefined;
    }
  };

  var literalOperators = {
    /**
     * Return a value without parsing.
     * @param obj
     * @param expr
     */
    $literal: function (obj, expr) {
      return expr;
    }
  };


  var variableOperators = {
    /**
     * Applies a subexpression to each element of an array and returns the array of resulting values in order.
     * @param obj
     * @param expr
     * @returns {Array|*}
     */
    $map: function (obj, expr) {
      var inputExpr = computeValue(obj, expr["input"], null);
      if (!_.isArray(inputExpr)) {
        throw new Error("Input expression for $map must resolve to an array");
      }
      var asExpr = expr["as"];
      var inExpr = expr["in"];

      // HACK: add the "as" expression as a value on the object to take advantage of "resolve()"
      // which will reduce to that value when invoked. The reference to the as expression will be prefixed with "$$".
      // But since a "$" is stripped of before passing the name to "resolve()" we just need to prepend "$" to the key.
      var tempKey = "$" + asExpr;
      // let's save any value that existed, kinda useless but YOU CAN NEVER BE TOO SURE, CAN YOU :)
      var original = obj[tempKey];
      return _.map(inputExpr, function (item) {
        obj[tempKey] = item;
        var value = computeValue(obj, inExpr, null);
        // cleanup and restore
        if (_.isUndefined(original)) {
          delete obj[tempKey];
        } else {
          obj[tempKey] = original;
        }
        return value;
      });

    },

    /**
     * Defines variables for use within the scope of a subexpression and returns the result of the subexpression.
     * @param obj
     * @param expr
     * @returns {*}
     */
    $let: function (obj, expr) {
      var varsExpr = expr["vars"];
      var inExpr = expr["in"];

      // resolve vars
      var originals = {};
      var varsKeys = _.keys(varsExpr);
      _.each(varsKeys, function (key) {
        var val = computeValue(obj, varsExpr[key], null);
        var tempKey = "$" + key;
        // set value on object using same technique as in "$map"
        originals[tempKey] = obj[tempKey];
        obj[tempKey] = val;
      });

      var value = computeValue(obj, inExpr, null);

      // cleanup and restore
      _.each(varsKeys, function (key) {
        var tempKey = "$" + key;
        if (_.isUndefined(originals[tempKey])) {
          delete obj[tempKey];
        } else {
          obj[tempKey] = originals[tempKey];
        }
      });

      return value;
    }
  };

  var booleanOperators = {
    /**
     * Returns true only when all its expressions evaluate to true. Accepts any number of argument expressions.
     * @param obj
     * @param expr
     * @returns {boolean}
     */
    $and: function (obj, expr) {
      var value = computeValue(obj, expr, null);
      return _.every(value);
    },

    /**
     * Returns true when any of its expressions evaluates to true. Accepts any number of argument expressions.
     * @param obj
     * @param expr
     * @returns {boolean}
     */
    $or: function (obj, expr) {
      var value = computeValue(obj, expr, null);
      return _.some(value);
    },

    /**
     * Returns the boolean value that is the opposite of its argument expression. Accepts a single argument expression.
     * @param obj
     * @param expr
     * @returns {boolean}
     */
    $not: function (obj, expr) {
      return !computeValue(obj, expr[0], null);
    }
  };

  // combine aggregate operators
  var aggregateOperators = _.extend(
    {},
    arrayOperators,
    arithmeticOperators,
    booleanOperators,
    comparisonOperators,
    conditionalOperators,
    dateOperators,
    literalOperators,
    setOperators,
    stringOperators,
    variableOperators
  );

  var OP_QUERY = Mingo.OP_QUERY = 'query',
    OP_GROUP = Mingo.OP_GROUP = 'group',
    OP_AGGREGATE = Mingo.OP_AGGREGATE = 'aggregate',
    OP_PIPELINE = Mingo.OP_PIPELINE = 'pipeline',
    OP_PROJECTION = Mingo.OP_PROJECTION = 'projection';

  // operator definitions
  var OPERATORS = {
    'aggregate': aggregateOperators,
    'group': groupOperators,
    'pipeline': pipelineOperators,
    'projection': projectionOperators,
    'query': queryOperators
  };

  // used for formatting dates in $dateToString operator
  var DATE_SYM_TABLE = {
    '%Y': ['$year', 4],
    '%m': ['$month', 2],
    '%d': ['$dayOfMonth', 2],
    '%H': ['$hour', 2],
    '%M': ['$minute', 2],
    '%S': ['$second', 2],
    '%L': ['$millisecond', 3],
    '%j': ['$dayOfYear', 3],
    '%w': ['$dayOfWeek', 1],
    '%U': ['$week', 2],
    '%%': '%'
  };

  function padDigits(number, digits) {
    return new Array(Math.max(digits - String(number).length + 1, 0)).join('0') + number;
  }

  /**
   * Return the registered operators on the given operator category
   * @param type catgory of operators
   * @returns {*}
   */
  function ops(type) {
    return _.keys(OPERATORS[type]);
  }

  /**
   * Groups the collection into sets by the returned key
   *
   * @param collection
   * @param fn
   */
  function groupBy(collection, fn) {

    var result = {
      'keys': [],
      'groups': []
    };

    _.each(collection, function (obj) {

      var key = fn(obj);
      var index = -1;

      if (_.isObject(key)) {
        for (var i = 0; i < result.keys.length; i++) {
          if (_.isEqual(key, result.keys[i])) {
            index = i;
            break;
          }
        }
      } else {
        index = _.indexOf(result.keys, key);
      }

      if (index > -1) {
        result.groups[index].push(obj);
      } else {
        result.keys.push(key);
        result.groups.push([obj]);
      }
    });

    // assert this
    if (result.keys.length !== result.groups.length) {
      throw new Error("assert groupBy(): keys.length !== groups.length");
    }

    return result;
  }

  /**
   * Returns the result of evaluating a $group operation over a collection
   *
   * @param collection
   * @param field the name of the aggregate operator or field
   * @param expr the expression of the aggregate operator for the field
   * @returns {*}
   */
  function accumulate(collection, field, expr) {
    if (_.contains(ops(OP_GROUP), field)) {
      return groupOperators[field](collection, expr);
    }

    if (_.isObject(expr)) {
      var result = {};
      for (var key in expr) {
        if (expr.hasOwnProperty(key)) {
          result[key] = accumulate(collection, key, expr[key]);
          // must run ONLY one group operator per expression
          // if so, return result of the computed value
          if (_.contains(ops(OP_GROUP), key)) {
            result = result[key];
            // if there are more keys in expression this is bad
            if (_.keys(expr).length > 1) {
              throw new Error("Invalid $group expression '" + JSON.stringify(expr) + "'");
            }
            break;
          }
        }
      }
      return result;
    }

    return undefined;
  }

  /**
   * Computes the actual value of the expression using the given object as context
   *
   * @param obj the current object from the collection
   * @param expr the expression for the given field
   * @param field the field name (may also be an aggregate operator)
   * @returns {*}
   */
  function computeValue(obj, expr, field) {

    // if the field of the object is a valid operator
    if (_.contains(ops(OP_AGGREGATE), field)) {
      return aggregateOperators[field](obj, expr);
    }

    // if expr is a variable for an object field
    // field not used in this case
    if (_.isString(expr) && expr.length > 0 && expr[0] === "$") {
      return resolve(obj, expr.slice(1));
    }

    var result;

    // check and return value if already in a resolved state
    if (isPrimitive(expr)) {
      return expr;
    } else if (_.isArray(expr)) {
      result = _.map(expr, function (item) {
        return computeValue(obj, item, null);
      });
    } else if (_.isObject(expr)) {
      result = {};
      for (var key in expr) {
        if (expr.hasOwnProperty(key)) {
          result[key] = computeValue(obj, expr[key], key);

          // must run ONLY one aggregate operator per expression
          // if so, return result of the computed value
          if (_.contains(ops(OP_AGGREGATE), key)) {
            result = result[key];
            // if there are more keys in expression this is bad
            if (_.keys(expr).length > 1) {
              throw new Error("Invalid aggregation expression '" + JSON.stringify(expr) + "'");
            }
            break;
          }
        }
      }
    }

    return result;
  }

}(this));


(function(root, undefined) {
    'use strict';

    //ensure lodash has contains method
    if (_ && !_.contains) {
        _.contains = _.includes;
    }

    /**
     * @description localForage query builder
     */
    function Query() {
        //TODO make use of condition builder on top of Mingo.Query
        //initialize empty condition collection
        this._conditions = {};

        //specify aggregation type
        this._aggregation = undefined;

        //specify projections
        this._projection = undefined;

        //specify sort criterias
        this._sort = undefined;

        //current path to be used in building query clause
        this._path = undefined;

        //specifies skip and limit conditions
        this._skip = undefined;
        this._limit = undefined;
    }


    //reference Query
    Query.prototype.Query = Query;


    /**
     * @name _hasConditions
     * @description check if query has conditions
     * @return {Boolean}
     */
    Query.prototype._hasConditions = function() {
        /*jshint validthis:true*/
        var self = this;
        var hasConditions = self._conditions && _.keys(self._conditions).length > 0;
        return hasConditions;
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
                id: key,
                _id: key
            });
        } else {
            return {
                id: key,
                _id: key,
                value: value
            };
        }
    };


    /**
     * @description Executes current query
     *
     * @example
     *     query.exec();
     *     query.exec(callback);
     *     query.exec('update');
     *     query.exec('find', callback);
     *
     * @param {String|Function} [operation]
     * @param {Function} [callback]
     * @api public
     */
    Query.prototype.exec = function exec(operation, callback) {
        if (_.isFunction(operation)) {
            callback = operation;
            operation = undefined;
        }

        if (operation) {
            this._operation = operation;
        }

        this[this._operation](callback);
    };


    /**
     * @description Executes the query returning a `Promise` which will be
     * resolved with either the doc(s) or rejected with the error.
     *
     * @param {Function} [resolve]
     * @param {Function} [reject]
     * @return {Promise}
     * @api public
     */

    Query.prototype.then = function(resolve, reject) {
        /*jshint validthis:true*/
        var self = this;
        var promise;

        //test angular 1.x promise
        if (!self.Promise.when) {
            promise = new self.Promise(function(_resolve, _reject) {
                self.exec(function(error, result) {
                    if (error) {
                        _reject(error);
                    } else {
                        _resolve(result);
                    }
                });
            });
        }
        // use angular 1.x $q promise
        else {
            promise = self.Promise(function(_resolve, _reject) {
                self.exec(function(error, result) {
                    if (error) {
                        _reject(error);
                    } else {
                        _resolve(result);
                    }
                });
            });
        }

        return promise.then(resolve, reject);
    };


    /**
     * @function
     * @description extend localForage with querying capabilities
     * @param  {Object} localForage an instance of localforage
     * @param {Object} [promise]    promise implementation to use. default to
     *                              native promise
     *
     * @return {Object} localforage instance with query capabilities
     * @public
     */
    Query.extend = function(localForage, promise) {
        //set query Promise library else use native promise
        Query.prototype.Promise = promise || Promise;

        //set localForage reference in query
        Query.prototype.localForage = localForage;

        //bind creators
        _.forEach(['create'], function(creator) {
            //extend localforage with creators
            localForage[creator] = function(data, done) {
                //instantiate new query
                var query = new Query();

                //create provided data
                return query.create.call(query, data, done);
            };
        });

        //bind finders
        _.forEach(['find', 'findOne', 'findById', 'where'], function(finder) {
            //extend localforage with finders
            localForage[finder] = function(criteria, done) {
                //instantiate new query
                var query = new Query();

                //expose finder
                return query[finder].call(query, criteria, done);
            };
        });

        //bind removers
        _.forEach(['remove', 'findByIdAndRemove', 'findOneAndRemove'], function(remover) {
            //extend localforage with removers
            localForage[remover] = function(criteria, done) {
                //instantiate new query
                var query = new Query();

                //expose remover
                return query[remover].call(query, criteria, done);
            };
        });

        //bind updators
        _.forEach(['update', 'findByIdAndUpdate', 'findOneAndUpdate'], function(updator) {
            //extend localforage with updators
            localForage[updator] = function(criteria, data, done) {
                //instantiate new query
                var query = new Query();

                //expose updator
                return query[updator].call(query, criteria, data, done);
            };
        });

        //bind default aggregator
        _.forEach(['count'], function(aggregator) {
            //extend localforage with aggregators
            localForage[aggregator] = function(criteria, done) {
                //instantiate new query
                var query = new Query();

                //expose aggregator
                return query[aggregator].call(query, criteria, done);
            };
        });

        return this.localForage;

    };


    //check node environment
    var nodeEnabled =
        ('undefined' !== typeof module && 'undefined' !== typeof require);

    // Export the forageQuery object for Node.js
    if (nodeEnabled) {
        module.exports = Query;
    } else {
        root.Query = Query;
    }

}(this));

(function(root, undefined) {

	'use strict';

	var Query = root.Query;

	/**
	 * @description count existing values based on criteria 
	 * @param  {Function} [done] a callback to invoke on suceess or error
	 * @return {Query}           query instance
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

(function(root, undefined) {

    'use strict';

    var Query = root.Query;

    //TODO add validation
    //TODO handle primitives type
    //TODO add beforeCreate
    //TODO add afterCreate

    /**
     * @function
     * @description create an item from the provided data
     * @param  {Object} data data to create 
     * @param  {Function} done a callback to invoke after create an item
     * @return {Object}            an object containing a data and its key
     * @public
     */
    Query.prototype.create = function(data, done) {
        /*jshint validthis:true*/
        var self = this;

        if (_.isFunction(data)) {
            done = data;
            data = undefined;
        }

        //tell what operation to perform
        self._operation = 'create';

        //if is collection of items perform batch create
        if (data && _.isArray(data)) {
            self._create(data);
        }

        //create single item
        if (data && !_.isArray(data)) {
            //prepare id for storing an item
            self._id = data.id || data._id || uuid.v1();

            //delete key or id
            delete data.id;
            delete data._id;

            //tell which data to create
            self._data = data;
        }

        //execute query
        if (done && _.isFunction(done)) {

            //execute batch
            if (self._creates) {
                self._create(done);
            }
            //execute simple
            else {

                self.localForage.setItem(self._id, self._data, function(error, result) {
                    //if error back off
                    if (error) {
                        done(error);
                    }

                    //return created item
                    else {

                        result = self._buildItem(self._id, result);

                        //we done return data
                        done(null, result);
                    }
                });
            }
        }

        //else return self
        return self;
    };


    /**
     * @function
     * @name create
     * @param  {Array<Object>}   data collection of item to insert
     * @param  {Function} [done] callback to invoke on success or error
     * @return {Query}         query instance
     * @private
     */
    Query.prototype._create = function(data, done) {
        /*jshint validthis:true*/
        var self = this;

        if (_.isFunction(data)) {
            done = data;
            data = undefined;
        }

        if (data) {
            //compact data
            data = _.compact(data);

            //prepare batch create
            data = _.map(data, function(item) {
                var query = new self.Query();
                return query.create.call(query, item);
            });

            //perform batch creation
            data = _.compact(data);
            self._creates = self.Promise.all(data);
        }

        if (done && _.isFunction(done)) {
            self._creates.then(function(results) {
                return done(null, results);
            }).catch(function(error) {
                return done(error);
            });
        }

        return self;
    };

}(this));

(function(root, undefined) {

    'use strict';

    var Query = root.Query;


    /**
     * @function
     * @description Specifies the complementary comparison value for paths 
     *              specified with where()
     * @param  {String} path  optional item path to perform comparison on.
     *                        if not specified previous path will be used
     * @param  {Object} value a value to be compared with the path value
     * @return {Query}       this
     * @public
     */
    Query.prototype.eq = Query.prototype.equals = function(path, value) {
        /*jshint validthis:true*/
        var self = this;

        // tell what operation to perform
        self._operation = 'find';

        //check if path is specified explicit
        if (_.size(arguments) === 2) {
            //if so, update path to use in the clause
            self._path = path;
        }

        //otherwise only value specified
        else {
            //set value to be used in comparison
            value = path;
        }

        //build where clause and update current query conditions
        var criteria = {};
        criteria[self._path] = {
            '$eq': value
        };
        self.where(criteria);

        //return self
        return self;
    };

}(this));

(function(root, undefined) {

    'use strict';

    var Query = root.Query;

    /**
     * @description find an item using specified criteria
     * @param  {Function} [done] callback to invoke on success or error
     * @return {Query}           query instance
     */
    Query.prototype.find = function(criteria, done) {
        /*jshint validthis:true*/
        var self = this;

        //tell what operation to perform
        self._operation = 'find';

        //normalize arguments
        if (criteria && _.isFunction(criteria)) {
            done = criteria;
            criteria = undefined;
        }

        //build or merge criterias
        if (criteria) {
            self.where(criteria);
        }

        //execute query
        if (done && _.isFunction(done)) {
            //if there is id or _id in condition clause
            //get item by its id
            var hasId = (_.has(self._conditions, 'id') ||
                    _.has(self._conditions, '_id')) &&
                (_.get(self._conditions, 'id.$eq') ||
                    _.get(self._conditions, '_id.$eq'));

            if (hasId) {
                var id = _.get(self._conditions, 'id.$eq') ||
                    _.get(self._conditions, '_id.$eq');
                    
                self.localForage.getItem(id, function(error, value) {
                    return done(error, self._buildItem(id, value));
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
                    return done(error);
                }
                // cursor
                else {
                    try {

                        //prepare result
                        items = _.map(items, function(item) {
                            return self._buildItem(item.key, item.value);
                        });

                        //cursor
                        items = self._cursor(items);

                        //return item(s)
                        return done(null, items);

                    } catch (e) {
                        return done(e);
                    }
                }
            });

        }

        return self;
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

        //extend value with its id
        value = _.extend(value, {
            id: key,
            _id: key
        });

        //make use of Mingo.Query to compile current conditions
        self._mingo = self._mingo || new Mingo.Query(self._conditions);

        //check if value(doc) match/pass specified conditions
        var pass = self._mingo.test(value);

        return pass;
    };


    /**
     * @function
     * @name _cursor
     * @param  {Array<Object>} items collection of items
     * @private
     */
    Query.prototype._cursor = function(items) {
        //jshint validthis:true
        var self = this;

        //build cursor
        items =
            new Mingo.Cursor(items, self._conditions, self._projection);

        //apply skip and limit to cursor
        if (self._skip && self._limit) {
            items = items.skip(self._skip).limit(self._limit);
        }

        //apply sort to cursor
        if (self._sort) {
            items = items.sort(self._sort);
        }

        //TODO aggregations

        if (self._aggregation) {
            //TODO handle other aggregations
            items = items.count();
            return items;
        }

        //fetch single item
        if (self._limit && self._limit === 1) {
            items = items.first();
            return items;
        }
        //fetch all item(s)
        else {
            items = items.all();
            return items;
        }

    };


    /**
     * @function
     * @name _aggregate
     * @param  {Array<Object>} items collection of items to apply 
     *                               aggregation pipelines on
     * @return {Array<Object>}
     * @private            
     */
    Query.prototype._aggregate = function(items) {
        //jshint validthis:true
        var self = this;

        //TODO handle sort in aggregation pipeline

        if (self._pipelines) {
            var aggregator = new Mingo.Aggregator(self._pipelines);

            items = aggregator.run(items);

            return items;

        } else {
            return items;
        }
    };

}(this));

(function(root, undefined) {

    'use strict';

    var Query = root.Query;
    /**
     * @description find an item by id 
     * @param  {Function} done [description]
     * @return {[type]}            [description]
     */
    Query.prototype.findById = function(id, done) {
        /*jshint validthis:true*/
        var self = this;

        //set current operationeration
        self._operation = 'find';

        if (_.isFunction(id)) {
            done = id;
            id = undefined;
        }

        //build find query conditions
        if (id) {
            self._conditions.id = {
                '$eq': id
            };
        }

        //set skip and limit conditions
        self.skip(0);
        self.limit(1);

        //exceute find query
        if (done && _.isFunction(done)) {
            self.find(done);
        }

        //return self
        return self;
    };

}(this));

(function(root, undefined) {

    'use strict';

    var Query = root.Query;

    /**
     * @function
     * @description find one item based on the criteria specified
     * @param  {Object}   criteria condition for filter items
     * @param  {Function} done     a callback to invoke after find one item
     * @return {Query}    this
     * @public
     */
    Query.prototype.findOne = function(criteria, done) {
        /*jshint validthis:true*/
        var self = this;

        //tell what operation to perform
        self._operation = 'find';

        //check if criteria provided
        if (_.isFunction(criteria)) {
            done = criteria;
            criteria = undefined;
        }

        //build where clause based on criteria
        if (criteria) {
            self.where(criteria);
        }

        //implicit specify limit condition
        self.limit(1);

        //execute find query
        if (done && _.isFunction(done)) {
            self.find(done);
        }


        //return self
        return self;

    };

}(this));

(function(root, undefined) {

    'use strict';

    var Query = root.Query;


    /**
     * @function
     * @description specifies limit condition
     * @param  {Integer} value a limit value
     * @return {Query}       
     * @public
     */
    Query.prototype.limit = function(value) {
        /*jshint validthis:true*/
        var self = this;

        // tell what operation to perform
        self._operation = 'find';

        //check for explicit skip
        if (!self._skip) {
            //implicit set skip value to zero
            self._skip = 0;
        }

        //set a limit condition
        self._limit = value || 1;

        //return self
        return self;
    };

}(this));

(function(root, undefined) {

	'use strict';

	var Query = root.Query;


	/**
	 * @function
	 * @description specifies skip condition
	 * @param  {Integer} value a skip value
	 * @return {Query}       
	 * @public
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

(function(root, undefined) {

    'use strict';

    var Query = root.Query;

    /**
     * @description query where clause builder
     * @param  {Object}   criteria valid query object
     * @param  {Function} [done]   callback to invoke on success or error
     * @return {Query}             query instance
     */
    Query.prototype.where = function(criteria, done) {
        /*jshint validthis:true*/
        var self = this;

        //tell what operation to perform
        self._operation = 'find';

        //check if criteria provided
        if (_.isFunction(criteria)) {
            done = criteria;
            criteria = undefined;
        }

        //if it just a string set it as current path for query clause
        if (_.isString(criteria)) {
            self._path = criteria;
        }


        //if it plain object parse it into conditions
        if (_.isPlainObject(criteria)) {
            self._parseCriteria(criteria);
        }

        //execute find query
        if (done && _.isFunction(done)) {
            self.find(done);
        }


        //return self
        return self;

    };


    /**
     * @function
     * @description parse provided criteria into query condition
     * @param  {Object} criteria a valid criteria
     * @private
     */
    Query.prototype._parseCriteria = function(criteria) {
        //TODO parse regex
        //TODO allow for inverted condition
        //TODO parse mongodb like, query filter

        /*jshint validthis:true*/
        var self = this;

        var paths = _.keys(criteria);

        _.forEach(paths, function(path) {
            //normalize criteria value to adhere to mongodb query style
            var criteriaValue = criteria[path];

            //convert primitives `equal` to use $eq query builder
            //to allow `query.eq` chain
            //i.e
            //query.where(name).eq('<name>').where('email').eq('<email>')
            if (!_.isPlainObject(criteriaValue)) {
                criteriaValue = {
                    '$eq': criteriaValue
                };
            }

            //check if path already exists in conditions
            if (_.has(self._conditions, path)) {
                //update to use complex path
                var _condition = self._condition[path];
                self._conditions[path] = _.extend(_condition, criteriaValue);
            }

            //add simple path in _conditions
            else {
                self._conditions[path] = criteriaValue;
            }
        });
    };

}(this));

(function(root, undefined) {

	'use strict';

	var Query = root.Query;

	/**
	 * @function
	 * @description remove existing item using its id
	 * @param  {Function} [done]  a callback to invoke on success or error
	 * @return {Query}            query instance
	 * @public
	 */
	Query.prototype.findByIdAndRemove = function(id, done) {
		//jshint validthis:true
		var self = this;

		//normalize arguments
		if (id && _.isFunction(id)) {
			done = id;
			id = undefined;
		}

		//prepare criteria
		var criteria;
		if (id) {
			//FIX Invalid expression for $or criteria in mingo
			criteria = {
				id: id
			};

			//ensure limit
			self.limit(1);
		}

		//throw no id
		else {
			throw new Error('Missing id');
		}

		return self.remove(criteria, done);
	};

}(this));

(function(root, undefined) {

	'use strict';

	var Query = root.Query;

	/**
	 * @function
	 * @description remove existing item using specified criteria
	 * @param  {Function} [done]  a callback to invoke on success or error
	 * @return {Query}            query instance
	 * @public
	 */
	Query.prototype.findOneAndRemove = function(criteria, done) {
		//jshint validthis:true
		var self = this;

		//normalize arguments
		if (criteria && _.isFunction(criteria)) {
			done = criteria;
			criteria = {};
		}

		//prepare criteria
		if (criteria) {
			//ensure limit
			self.limit(1);
		}

		return self.remove(criteria, done);
	};

}(this));

(function(root, undefined) {

	'use strict';

	var Query = root.Query;

	/**
	 * @description remove existing item(s) using specified criteria
	 * @param {Object} [criteria]  selector
	 * @param  {Function} [done]   a callback to invoke on success or error
	 * @return {Query}             query instance
	 */
	Query.prototype.remove = function(criteria, done) {
		//TODO make use of sub queries

		// jshint validthis:true
		var self = this;

		//tell what operation to perform
		self._operation = 'remove';

		//normalize arguments
		if (criteria && _.isFunction(criteria)) {
			done = criteria;
			criteria = {};
		}

		if (criteria && !self._removes) {
			//find items to remove
			var query = new self.Query();
			self._removes = query.find.call(query, criteria);
			//TODO clone other criteria and merge to self._removes
			if (self._limit) {
				self._removes.limit(self._limit);
			}
		}

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
		var removes = _.map([].concat(self._removes), function(item) {
			var id = _.get(item, 'id') || _.get(item, '_id');
			return self.localForage.removeItem(id).then(function() {
				return id;
			});
		});

		//compact removes
		removes = _.compact(removes);

		//perform batch remove
		removes = self.Promise.all(removes);

		return removes.then(function( /*results*/ ) {
			//return removed items
			return self._removes;
		});

	};

}(this));

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

(function(root, undefined) {

	'use strict';

	var Query = root.Query;

	/**
	 * @function
	 * @description update existing item using its id
	 * @param {String} id selector
	 * @param {Object} data updates
	 * @param  {Function} [done]  a callback to invoke on success or error
	 * @return {Query}            query instance
	 * @public
	 */
	Query.prototype.findByIdAndUpdate = function(id, data, done) {
		//jshint validthis:true
		var self = this;

		//normalize arguments
		if (id && _.isFunction(id)) {
			done = id;
			id = undefined;
		}

		//prepare criteria
		var criteria;
		if (id) {
			//FIX Invalid expression for $or criteria in mingo
			criteria = {
				id: id
			};

			//ensure limit
			self.limit(1);
		}

		//throw no id
		else {
			throw new Error('Missing id');
		}

		return self.update(criteria, data, done);
	};

}(this));

(function(root, undefined) {

	'use strict';

	var Query = root.Query;

	/**
	 * @function
	 * @description update existing item using specified criteria
	 *  @param {Object} criteria selector
	 * @param {Object} data updates
	 * @param  {Function} [done]  a callback to invoke on success or error
	 * @return {Query}            query instance
	 * @public
	 */
	Query.prototype.findOneAndUpdate = function(criteria, data, done) {
		//jshint validthis:true
		var self = this;

		//normalize arguments
		if (criteria && _.isFunction(criteria)) {
			done = criteria;
			criteria = {};
		}

		//ensure limit
		if (criteria) {
			//ensure limit
			self.limit(1);
		}

		return self.update(criteria, data, done);
	};

}(this));

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

}));
