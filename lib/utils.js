'use strict';

const _ = require('lodash');

let Utils = exports;

/**
 * Mutates obj to only contain non empty properties. You can limit it with
 * limitTo to specific properties.
 *
 * @param  {object} obj      - [description]
 * @param  {array} [limitTo] - Array of properties. If this is set, function
 *                             will only delete empty properties where key is
 *                             defined in this array.
 * @return {object}          - returns obj again (also mutates obj)
 */
Utils.deleteEmptyProperties = function deleteEmptyProperties(obj, limitTo) {
  if(_.isEmpty(limitTo)) limitTo = _.keys(obj);
  _(limitTo).filter(o => _.isEmpty(obj[o])).each(u => {_.unset(obj, u);});
  return obj;
}


Utils._setFields = function _setFields(allowedFields, fieldsToSelect) {
  let fields;
  if(_.isEmpty(fieldsToSelect)) {
    // If fieldsToSelect is empty, we want to select all allowedFields.
    fields = _.values(allowedFields);
  } else {
    // Otherwise, only select fields which are in both fieldsToSelect and allowedFields
    fields = _(fieldsToSelect).map(f => allowedFields[f]).remove(v => {return !_.isUndefined(v)}).value();
  }
  return fields;
}

Utils.setFields = function setFields(query, allowedFields, fieldsToSelect) {
  query.fields(Utils._setFields(allowedFields, fieldsToSelect));
}
