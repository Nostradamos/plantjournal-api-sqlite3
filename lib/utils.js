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

/**
 * Helper function of Utils.setFields(), decides which fields should get selected
 * later in the main function. Criterias: field has to be in allowedFields. Will
 * get translated to alias.
 * @param {object} allowedFields - Plain object where key is field name, and value is alias.
 * @param {array} fieldsToSelect - Array of strings/field names. Typically options.fields
 * @return {array}               - translated and verfied alias fields
 */
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

/**
 * Takes an squel query object and sets all field alisaes of fieldsToSelect which are
 * in allowedFields as a key property. Mutates query object.
 * See Utils._setFields() for more information.
 * @param {squel} fieldsToSelect - Squel obejct. Has to be in select() state or similiar to
 *                                 take a fields() call.
 * @param {object} allowedFields - Plain object where key is field name, and value is alias.
 * @param {array} fieldsToSelect - Array of strings/field names. Typically options.fields
 */
Utils.setFields = function setFields(query, allowedFields, fieldsToSelect) {
  query.fields(Utils._setFields(allowedFields, fieldsToSelect));
}

/**
 * Takes an squel query object and sets limit() and offset() depending on the
 * given options object. Default limit is 10, default offset 0.
 * Mutates query object.
 * @param {squel} query          - Squel obejct. Has to be in a state to take a
 *                                 limit() and offset() function call.
 * @param {object} options       - options object. Can be empty.
 * @param {int} [options.limit]  - Limit to set. If empty, will set to 10.
 * @param {int} [options.offset] - Offset to set. If empty, will set to 0.
 */
Utils.setLimitAndOffset = function setLimitAndOffset(query, options) {
  let limit = options.limit || 10;
  let offset = options.offset || 0;
  query.limit(limit).offset(offset);
}
