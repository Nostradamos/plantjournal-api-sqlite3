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
 * Function determining if an object needs to get sanitized before we can pass
 * it to the squel JSON() function. We need to sanitize everything except of
 * Numbers and strings which are not valid JSON.
 * @param  {Object} obj
 *         Object to test for sanitization
 * @param  {Boolean} onExtract=false
 *         For JSON_EXTRACT functions we don't have to quote JSON strings,
 *         so we have this flag for those cases.
 * @return {Boolean}
 *         Returns true if object needs to get sanitized
 */
UtilsJSON.needToSanitize = function(obj, onExtract=false) {
  if(onExtract === true) {
    return !(_.isString(obj) &&
           !UtilsJSON.isValidJSON(obj)) &&
           !_.isNumber(obj);
  }
  return !_.isNumber(obj);
};

/**
 * Sanitizes an object if it need's to get sanitized.
 * @param  {Object} obj
 *         Object to sanitize
 * @param  {Boolean} onExtract=false
 *         For JSON_EXTRACT functions we don't have to quote JSON strings,
 *         so we have this flag for those cases.
 * @return {String|Number}
 *         Returns sanitized string or a number
 */
UtilsJSON.sanitize = function (obj, onExtract=false) {
  if(UtilsJSON.needToSanitize(obj, onExtract)) {
    return JSON.stringify(obj);
  }
  return obj;
};

UtilsJSON.sanitizeArray = function (arr, onExtract=false) {
  let sanitizedArr = arr;
  for(let i=0;i<arr.length;i++) {
    sanitizedArr[i] = UtilsJSON.sanitize(arr[i], onExtract);
  }
  return sanitizedArr;
};

UtilsJSON.parseIfPossible = function(str) {
  try {
    return JSON.parse(str);
  } catch(err) {
    return str;
  }
};
