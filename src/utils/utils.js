'use strict';

const _ = require('lodash');
const squel = require('squel');
const sqlite = require('sqlite');

/**
 * Utils.
 * @namespace
 */
let Utils = exports;

/**
 * Mutates obj to only contain non empty properties. You can limit it with
 * limitTo to specific properties.
 * @param  {object} obj
 *         Object to delete from
 * @param  {array} [limitTo]
 *         Array of properties. If this is set, function will only delete empty
 *         properties where key is defined in this array.
 * @return {object}
 *         returns obj again (also mutates obj)
 */
Utils.deleteEmptyProperties = function(obj, limitTo) {
  if (_.isEmpty(limitTo)) limitTo = _.keys(obj);
  _(limitTo).filter(o => _.isEmpty(obj[o])).each(u => {
    _.unset(obj, u);
  });
  return obj;
};

/**
 * Make sure obj is an assoc array/object with key/value pairs.
 * If not, throws an error.
 * @param  {Object}  obj
 *         Object to check
 * @param  {String}  [prefix='First argument']
 *         Name of object for error message.
 */
Utils.hasToBeAssocArray = function (obj, prefix = 'First argument') {
  if (!_.isObjectLike(obj) || _.isArray(obj)) {
    throw new Error(prefix + ' has to be an associative array');
  }
};

/**
 * Make sure obj.property is a string. If not, throws an error.
 * @param  {Object}  obj              - Object to look at
 * @param  {String}  property         - Name of the property which should be a
 *                                      String
 * @param  {String}  [name='options'] - In case of an error, how to name the
 *                                      Object? Defaults to options.
 */
Utils.hasToBeString = function(obj, property, name = 'options') {
  if (_.has(obj, property) && !_.isString(obj[property])) {
    throw new Error(name + '.' + property + ' has to be a string');
  }
};

/**
 * Make sure obj.property is an integer. If not, throws an error.
 * @param  {Object}  obj              - Object to look at
 * @param  {String}  property         - Name of the property which should be an
 *                                      int
 * @param  {String}  [name='options'] - In case of an error, how to name the
 *                                      Object? Defaults to options.
 */
Utils.hasToBeInt = function(obj, property, name = 'options') {
  if (_.has(obj, property) && !_.isInteger(obj[property])) {
    throw new Error(name + '.' + property + ' has to be an integer');
  }
};

Utils.hasToBeIntOrNull = function(obj, property, name = 'options') {
  let value = obj[property];
  if (!_.isUndefined(value) && !_.isInteger(value) && !_.isNull(value)) {
    throw new Error(
      name + '.' + property + ' has to be an integer or null');
  }
};

/**
 * Make sure obj.property is an array only consisting of integers.
 * If not, throws an error.
 * @param  {Object}  obj              - Object to look at
 * @param  {String}  property         - Name of the property which should be an
 *                                      array of integers
 * @param  {String}  [name='options'] - In case of an error, how to name the
 *                                      Object? Defaults to options.
 */
Utils.hasToBeIntArray = function(obj, property, name = 'options') {
  let value = obj[property];
  if(_.isUndefined(value)) return;
  if (!_.isArray(value) || !_.every(value, _.isInteger)) {
    throw new Error(
      name + '.' + property + ' has to be an array of integers');
  }
};

/**
 * Make sure obj.property is set, and if not, throw an error.
 * @param  {Object}  obj              - Object to look at
 * @param  {String}  property         - Name of the property which should be set
 * @param  {String}  [name='options'] - In case of an error, how to name the
 *                                      Object? Defaults to options.
 */
Utils.hasToBeSet = function(obj, property, name = 'options') {
  if (!_.has(obj, property)) {
    throw new Error(name + '.' + property + ' has to be set');
  }
};

/**
 * Return a unix timestamp (seconds)
 * @return {UnixTimestampUTC} Unix Timestamp
 */
Utils.getUnixTimestampUTC = function() {
  return Math.floor(new Date() / 1000);
};

/**
 * Converts Set to array and deletes null from it before. Mutates set.
 * @param  {Set} set - Set to where and convert
 * @return {Array}   - Arrayfied set without null elements
 */
Utils.whereSetNotNull = function(set) {
  set.delete(null);
  return Array.from(set);
};

/**
 * Checks if we are connected to sqlite database. If not, throws error.
 * @throws {Error}
 */
Utils.throwErrorIfNotConnected = function() {
  if (sqlite.driver != null && sqlite.driver.open === true) {
    return;
  }
  throw Error('plantJournal is not connected to database.');
};

Utils.explicitColumn = function(table, column) {
  return table + '.' + column;
};

Utils.explicitColumnRstr = function(table, column) {
  return squel.rstr(Utils.explicitColumn(table, column));
};

/**
 * Split a string of numbers seperated by "," (or any other seperator) into
 * an array of integers.
 * @param  {String|null} str
 *         A string with numbers (which can get casted to integer) seperated by
 *         a comma. Or null.
 * @param  {String} [sep=',']
 *         Seperator
 * @return {Integer[]}
 *         Integer array, if string is empty or null, array will be emtpy too.
 */
Utils.splitToInt = function(str, sep = ',') {
  return str === null ? [] : _(str).split(sep).map(_.toInteger).value();
};
