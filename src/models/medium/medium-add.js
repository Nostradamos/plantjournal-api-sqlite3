'use strict';

const _ = require('lodash');

const CONSTANTS = require('../../constants');
const Utils = require('../../utils/utils');

const AbstractModelAdd = require('../abstract/abstract-model-add');

/**
 * This class creates a new Medium and gets internally called from
 * Medium.add(). If you want to know how Create works internally, see
 * src/controller/generic-add. If you want to know how to use the
 * Medium.add() API from outside, see src/models/Medium #create().
 * @private
 * @extends AbstractModelAdd
 */
class MediumAdd extends AbstractModelAdd {
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
  validate(context, isOrigin) {
    let options = context.options;

    // Some additional validations if we got called from a child class
    if(!isOrigin) {
      if(options[CONSTANTS.ATTR_ID_MEDIUM] === null) return false;

      if(_.has(options, CONSTANTS.ATTR_ID_MEDIUM)) {
        Utils.hasToBeInt(options, CONSTANTS.ATTR_ID_MEDIUM);
        return false;
      }

      // If we don't have any attributes available for creating a new
      // medium, don't create one.
      if(!options[CONSTANTS.ATTR_NAME_MEDIUM] &&
         !options[CONSTANTS.ATTR_NAME_MEDIUM] &&
         !options[CONSTANTS.ATTR_DESCRIPTION_MEDIUM] &&
         !options[CONSTANTS.ATTR_ID_ENVIRONMENT]) {
        return false;
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
   *         options object which got passed to AbstractModelAdd.add().
   * @throws {Error}
   *         Will throw error if options.familyId does not reference an
   *         existing family.
   */
  async insert(self, context, transaction) {
    try {
      await super.insert(self, context, transaction);
    } catch(err) {
      if (err.code === 'SQLITE_CONSTRAINT') {
        throw new Error('options.environmentId does not reference an existing environment');
      }
      throw err;
    }
  }
}

MediumAdd.PARENT = 'Environment';

MediumAdd.TABLE = CONSTANTS.TABLE_MEDIUM;

MediumAdd.ATTR_ID = CONSTANTS.ATTR_ID_MEDIUM;

MediumAdd.ATTR_ADDED_AT = CONSTANTS.ATTR_ADDED_AT_MEDIUM;

MediumAdd.ATTR_MODIFIED_AT = CONSTANTS.ATTR_MODIFIED_AT_MEDIUM;

MediumAdd.ATTR_FILL_CHILD_IDS = CONSTANTS.ATTR_PLANTS_MEDIUM;

MediumAdd.ATTR_CHILD_ID = CONSTANTS.ATTR_ID_PLANT;

MediumAdd.ATTRIBUTES = CONSTANTS.ATTRIBUTES_MEDIUM;

MediumAdd.SKIP_ATTRIBUTES = [
  CONSTANTS.ATTR_PLANTS_MEDIUM
];

MediumAdd.DEFAULT_VALUES_ATTRIBUTES = {
  [CONSTANTS.ATTR_DESCRIPTION_MEDIUM]: '',
  [CONSTANTS.ATTR_PLANTS_MEDIUM]: []
};

MediumAdd.PLURAL = CONSTANTS.PLURAL_MEDIUM;


module.exports = MediumAdd;
