'use strict';

const _ = require('lodash');

/**
 * UtilsJSON.
 * @namespace
 */
let UtilsJSON = exports;

/**
 * Checks if a string is valid JSON
 * @param  {String} str
 *         String which should get validated
 * @return {Boolean}
 *         Returns true if str is json, otherwise false
 */
UtilsJSON.isValidJSON = function(str) {
  try {
    JSON.parse(str);
  } catch(err) {
    return false;
  }
  return true;
};


/**
 * Function determining if an object needs to get sanitized before it can
 * get stringified. We need to sanitize everything except of Numbers.
 * @param  {Object} obj
 *         Object to test for sanitization
 * @return {Boolean}
 *         Returns true if object needs to get sanitized
 */
UtilsJSON.needToSanitize = function(obj) {
  return !_.isNumber(obj);
};

/**
 * Sanitizes an object if it need's to get sanitized.
 * @param  {[type]} obj [description]
 * @return {[type]}     [description]
 */
UtilsJSON.sanitize = function (obj) {
  if(UtilsJSON.needToSanitize(obj)) {
    return JSON.stringify(obj);
  }
  return obj;
};

UtilsJSON.sanitizeArray = function (arr) {
  let sanitizedArr = arr;
  for(let i=0;i<arr.length;i++) {
    sanitizedArr[i] = UtilsJSON.sanitize(arr[i]);
  }
  return sanitizedArr;
};

UtilsJSON.parseIfPossible = function(str) {
  try {
    return JSON.parse(str);
  } catch(err) {
    return str;
  }
}
