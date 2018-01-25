'use strict';

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
     */
  static validate(self, context) {
    let options = context.options;
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
