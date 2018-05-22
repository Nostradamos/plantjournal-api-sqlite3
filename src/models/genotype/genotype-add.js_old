'use strict';

const _ = require('lodash');

const CONSTANTS = require('../../constants');
const Utils = require('../../utils/utils');

const GenericAdd = require('../generic/generic-add');
const GenerationAdd = require('../generation/generation-add');

/**
 * GentopyeCreate Class which creates a new Genotype.
 * Gets internally called from Genotype.add(). If you want
 * to know how Create works internally, see
 * src/controller/generic-add.
 * If you want to know how to use the Genotype.add()
 * API from outside, see src/models/Genotype #create().
 * @private
 * @extends GenericAdd
 */
class GenotypeAdd extends GenericAdd {

  /**
   * We need to validate input and throw errors if we're
   * unhappy with it.
   * @param  {object} self
   *         Namespace/object only for the context of this class and this
   *         creation process. Not shared across differenct classes in
   *         callStack.
   * @param  {object} context
   *         Namespace/object of this creation process. It's shared across
   *         all classes in callStack.
   * @return {Boolean}
   *         Return true if we don't need to insert this record and this class
   *         reference and it's parents should get deleted from the callStack.
   * @throws {Error}
   */
  static validate(self, context) {
    let options = context.options;

    // Some additional validations if we got called from a child class
    if(context.creatingClassName !== this.name) {
      if(_.has(options, CONSTANTS.ATTR_ID_GENOTYPE)) {
        Utils.hasToBeInt(options, CONSTANTS.ATTR_ID_GENOTYPE);
        return true;
      }

      if(_.has(options, CONSTANTS.ATTR_CLONED_FROM_PLANT)) {
        Utils.hasToBeInt(options, CONSTANTS.ATTR_CLONED_FROM_PLANT);
        return true;
      }
    }

    Utils.hasToBeString(options, CONSTANTS.ATTR_NAME_GENOTYPE);
    Utils.hasToBeString(options, CONSTANTS.ATTR_DESCRIPTION_GENOTYPE);
  }

  /**
   * We want to catch foreign key error to custom throw error that genotype
   * reference failed.
   * @async
   * @param  {object} self
   *         Namespace/object only for the context of this class and this
   *         creation process. Not shared across differenct classes in
   *         callStack.
   * @param  {object} context
   *         Namespace/object of this creation process. It's shared across
   *         all classes in callStack.
   * @throws {Error}
   *         If generationId reference fails we will throw custom error,
   *         everything else should be a sqlite error.
   */
  static async executeQuery(self, context) {
    try {
      await super.executeQuery(self, context);
    } catch (err) {
      // We only have one foreign key so we can safely assume, if a
      // foreign key constraint fails, it's the generationId constraint.
      if (err.message === 'SQLITE_CONSTRAINT: FOREIGN KEY constraint failed') {
        throw new Error('options.generationId does not reference an existing Generation');
      }
      throw err;
    }
  }
}

GenotypeAdd.PARENT = GenerationAdd;

GenotypeAdd.TABLE = CONSTANTS.TABLE_GENOTYPE;

GenotypeAdd.ATTR_ID = CONSTANTS.ATTR_ID_GENOTYPE;

GenotypeAdd.ATTR_ADDED_AT = CONSTANTS.ATTR_ADDED_AT_GENOTYPE;

GenotypeAdd.ATTR_MODIFIED_AT = CONSTANTS.ATTR_MODIFIED_AT_GENOTYPE;

GenotypeAdd.ATTR_FILL_CHILD_IDS = CONSTANTS.ATTR_PLANTS_GENOTYPE;

GenotypeAdd.ATTR_CHILD_ID = CONSTANTS.ATTR_ID_PLANT;

GenotypeAdd.ATTRIBUTES = CONSTANTS.ATTRIBUTES_GENOTYPE;

GenotypeAdd.SKIP_ATTRIBUTES = [
  CONSTANTS.ATTR_PLANTS_GENOTYPE
];

GenotypeAdd.DEFAULT_VALUES_ATTRIBUTES = {
  [CONSTANTS.ATTR_DESCRIPTION_GENOTYPE]: '',
  [CONSTANTS.ATTR_NAME_GENOTYPE]: '',
  [CONSTANTS.ATTR_PLANTS_GENOTYPE]: []
};

GenotypeAdd.PLURAL = CONSTANTS.PLURAL_GENOTYPE;

module.exports = GenotypeAdd;
