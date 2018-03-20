'use strict';

const _ = require('lodash');

const CONSTANTS = require('../../constants');
const Utils = require('../../utils/utils');

const GenericCreate = require('../generic/generic-create');
const EnvironmentCreate = require('../environment/environment-create');

/**
 * This class creates a new Medium and gets internally called from
 * Medium.create(). If you want to know how Create works internally, see
 * src/controller/generic-create. If you want to know how to use the
 * Medium.create() API from outside, see src/models/Medium #create().
 * @private
 * @extends GenericCreate
 */
class MediumCreate extends GenericCreate {
  /**
   * We need to validate the properties for new Medium.
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
      if(options[CONSTANTS.ATTR_ID_MEDIUM] === null) return true;

      if(_.has(options, CONSTANTS.ATTR_ID_MEDIUM)) {
        Utils.hasToBeInt(options, CONSTANTS.ATTR_ID_MEDIUM);
        return true;
      }

      // If we don't have any attributes available for creating a new
      // medium, don't create one.
      if(!options[CONSTANTS.ATTR_NAME_MEDIUM] &&
         !options[CONSTANTS.ATTR_NAME_MEDIUM] &&
         !options[CONSTANTS.ATTR_DESCRIPTION_MEDIUM] &&
         !options[CONSTANTS.ATTR_ID_ENVIRONMENT]) {
        return true;
      }
    }

    Utils.hasToBeSet(options, CONSTANTS.ATTR_NAME_MEDIUM);

    Utils.hasToBeString(options, CONSTANTS.ATTR_NAME_MEDIUM);
    Utils.hasToBeString(options, CONSTANTS.ATTR_DESCRIPTION_MEDIUM);
    Utils.hasToBeIntOrNull(options, CONSTANTS.ATTR_ID_ENVIRONMENT);
  }


  /**
   * We need to catch foreig key constraing failed error to throw our
   * own error.
   * @async
   * @param  {object} context
   *         internal context object in #create().
   * @param  {object} options
   *         options object which got passed to GenericCreate.create().
   * @throws {Error}
   *         Will throw error if options.familyId does not reference an
   *         existing family.
   */
  static async executeQuery(context, options) {
    try {
      await super.executeQuery(context, options);
    } catch(err) {
      if (err.message === 'SQLITE_CONSTRAINT: FOREIGN KEY constraint failed') {
        throw new Error('options.environmentId does not reference an existing environment');
      }
      throw err;
    }
  }
}

MediumCreate.PARENT = EnvironmentCreate;

MediumCreate.TABLE = CONSTANTS.TABLE_MEDIUM;

MediumCreate.ATTR_ID = CONSTANTS.ATTR_ID_MEDIUM;

MediumCreate.ATTR_CREATED_AT = CONSTANTS.ATTR_CREATED_AT_MEDIUM;

MediumCreate.ATTR_MODIFIED_AT = CONSTANTS.ATTR_MODIFIED_AT_MEDIUM;

MediumCreate.ATTR_FILL_CHILD_IDS = CONSTANTS.ATTR_PLANTS_MEDIUM;

MediumCreate.ATTR_CHILD_ID = CONSTANTS.ATTR_ID_PLANT;

MediumCreate.ATTRIBUTES = CONSTANTS.ATTRIBUTES_MEDIUM;

MediumCreate.SKIP_ATTRIBUTES = [
  CONSTANTS.ATTR_PLANTS_MEDIUM
];

MediumCreate.DEFAULT_VALUES_ATTRIBUTES = {
  [CONSTANTS.ATTR_DESCRIPTION_MEDIUM]: '',
  [CONSTANTS.ATTR_PLANTS_MEDIUM]: []
};

MediumCreate.PLURAL = CONSTANTS.PLURAL_MEDIUM;


module.exports = MediumCreate;
