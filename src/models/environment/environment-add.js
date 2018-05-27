'use strict';

const _ = require('lodash');

const CONSTANTS = require('../../constants');
const Utils = require('../../utils/utils');

const AbstractModelAdd = require('../abstract/abstract-model-add');

/**
 * This class creates a new Environment and gets internally called from
 * Environment.add(). If you want to know how Create works internally, see
 * src/controller/generic-add. If you want to know how to use the
 * Environment.add() API from outside, see src/models/Environment #create().
 * @private
 * @extends GenericAdd
 */
class EnvironmentAdd extends AbstractModelAdd {
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
  validate(context, isOrigin) {
    let options = context.options;

    // Some additional validations if we got called from a child class
    if(isOrigin === false) {
      if(_.has(options, CONSTANTS.ATTR_ID_ENVIRONMENT)) {
        if(options[CONSTANTS.ATTR_ID_ENVIRONMENT] === null) return false;
        Utils.hasToBeInt(options, CONSTANTS.ATTR_ID_ENVIRONMENT);
        return false;
      }

      if(!_.has(options, CONSTANTS.ATTR_NAME_ENVIRONMENT)) return false;
    }

    Utils.hasToBeSet(options, CONSTANTS.ATTR_NAME_ENVIRONMENT);

    Utils.hasToBeString(options, CONSTANTS.ATTR_NAME_ENVIRONMENT);
    Utils.hasToBeString(options, CONSTANTS.ATTR_DESCRIPTION_ENVIRONMENT);
  }
}

EnvironmentAdd.TABLE = CONSTANTS.TABLE_ENVIRONMENT;

EnvironmentAdd.ATTR_ID = CONSTANTS.ATTR_ID_ENVIRONMENT;

EnvironmentAdd.ATTR_ADDED_AT = CONSTANTS.ATTR_ADDED_AT_ENVIRONMENT;

EnvironmentAdd.ATTR_MODIFIED_AT = CONSTANTS.ATTR_MODIFIED_AT_ENVIRONMENT;

EnvironmentAdd.ATTR_FILL_CHILD_IDS = CONSTANTS.ATTR_MEDIUMS_ENVIRONMENT;

EnvironmentAdd.ATTR_CHILD_ID = CONSTANTS.ATTR_ID_MEDIUM;

EnvironmentAdd.ATTRIBUTES = CONSTANTS.ATTRIBUTES_ENVIRONMENT;

EnvironmentAdd.SKIP_ATTRIBUTES = [
  CONSTANTS.ATTR_MEDIUMS_ENVIRONMENT
];

EnvironmentAdd.DEFAULT_VALUES_ATTRIBUTES = {
  [CONSTANTS.ATTR_DESCRIPTION_ENVIRONMENT]: '',
  [CONSTANTS.ATTR_MEDIUMS_ENVIRONMENT]: []
};

EnvironmentAdd.PLURAL = CONSTANTS.PLURAL_ENVIRONMENT;


module.exports = EnvironmentAdd;
