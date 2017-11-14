'use strict';

const _ = require('lodash');

/**
 * UtilsJSON.
 * @namespace
 */
let UtilsJSON = exports;

UtilsJSON.isValidJSON = function(str) {
  try {
    JSON.parse(str);
  } catch(err) {
    return false;
  }
  return true;
};

UtilsJSON.needToSanitize = function(obj) {
  return _.isArray(obj) ||
         _.isBoolean(obj) ||
         _.isPlainObject(obj);
};

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
