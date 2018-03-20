'use strict';

const _ = require('lodash');

const CONSTANTS = require('../../constants');
const Utils = require('../../utils/utils');

const GenericCreate = require('../generic/generic-create');

/**
 * This class creates a new Environment and gets internally called from
 * Environment.create(). If you want to know how Create works internally, see
 * src/controller/generic-create. If you want to know how to use the
 * Environment.create() API from outside, see src/models/Environment #create().
 * @private
 * @extends GenericCreate
 */
class EnvironmentCreate extends GenericCreate {
  /**
   * We need to validate the properties for new environment.
   * @param  {object} self
   *         Namespace/object only for the context of this class and this
   *         creation process. Not shared across differenct classes in
   *         callStack.
   * @param  {object} context
   *         Namespace/object of this creation process. It's shared across
   *         all classes in callStack.
   * @throws {Error}
   * @return {Boolean}
   *         Return true if we don't need to insert this record and this class
   *         reference and it's parents should get deleted from the callStack.
   */
  static validate(self, context) {
    let options = context.options;

    // Some additional validations if we got called from a child class
    if(context.creatingClassName !== this.name) {
      if(_.has(options, CONSTANTS.ATTR_ID_ENVIRONMENT)) {
        if(options[CONSTANTS.ATTR_ID_ENVIRONMENT] === null) return true;
        Utils.hasToBeInt(options, CONSTANTS.ATTR_ID_ENVIRONMENT);
        return true;
      }

      if(!_.has(options, CONSTANTS.ATTR_NAME_ENVIRONMENT)) return true;
    }

    Utils.hasToBeSet(options, CONSTANTS.ATTR_NAME_ENVIRONMENT);

    Utils.hasToBeString(options, CONSTANTS.ATTR_NAME_ENVIRONMENT);
    Utils.hasToBeString(options, CONSTANTS.ATTR_DESCRIPTION_ENVIRONMENT);
  }
}

EnvironmentCreate.TABLE = CONSTANTS.TABLE_ENVIRONMENT;

EnvironmentCreate.ATTR_ID = CONSTANTS.ATTR_ID_ENVIRONMENT;

EnvironmentCreate.ATTR_CREATED_AT = CONSTANTS.ATTR_CREATED_AT_ENVIRONMENT;

EnvironmentCreate.ATTR_MODIFIED_AT = CONSTANTS.ATTR_MODIFIED_AT_ENVIRONMENT;

EnvironmentCreate.ATTR_FILL_CHILD_IDS = CONSTANTS.ATTR_MEDIUMS_ENVIRONMENT;

EnvironmentCreate.ATTR_CHILD_ID = CONSTANTS.ATTR_ID_MEDIUM;

EnvironmentCreate.ATTRIBUTES = CONSTANTS.ATTRIBUTES_ENVIRONMENT;

EnvironmentCreate.SKIP_ATTRIBUTES = [
  CONSTANTS.ATTR_MEDIUMS_ENVIRONMENT
];

EnvironmentCreate.DEFAULT_VALUES_ATTRIBUTES = {
  [CONSTANTS.ATTR_DESCRIPTION_ENVIRONMENT]: '',
  [CONSTANTS.ATTR_MEDIUMS_ENVIRONMENT]: []
};

EnvironmentCreate.PLURAL = CONSTANTS.PLURAL_ENVIRONMENT;


module.exports = EnvironmentCreate;
