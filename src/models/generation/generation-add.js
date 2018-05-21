'use strict';

const _ = require('lodash');

const CONSTANTS = require('../../constants');
const Utils = require('../../utils/utils');

const AbstractModelAdd = require('../abstract/abstract-model-add');

/**
 * GenerationAdd Class which creates a new Generation.
 * Gets internally called from Generation.add(). If you want
 * to know how Create works internally, see
 * src/controller/generic-add.
 * If you want to know how to use the Generation.add()
 * API from outside, see src/models/Generation #create().
 * @private
 * @extends GenericAdd
 */
class GenerationAdd extends AbstractModelAdd {

  /**
   * We need to validate input and throw errors if we're unhappy with it.
   * @param  {object} self
   *         Namespace/object only for the context of this class and this
   *         creation process. Not shared across differenct classes in
   *         callStack.
   * @param  {object} context
   *         Namespace/object of this creation process. It's shared across
   *         all classes in callStack.
   * @throws {Error}
   *         Throws error if we are unhappy with the options object.
   * @return {Boolean}
   *         Return true if we don't need to insert this record and this class
   *         reference and it's parents should get deleted from the callStack.
   */
  validate(context) {
    let options = context.options;

    // Some additional validations if we got called from a child class
    /*if(context.creatingClassName !== this.name) {
      if(options[CONSTANTS.ATTR_ID_GENERATION] === null) return true;

      if(_.has(options, CONSTANTS.ATTR_ID_GENERATION)) {
        Utils.hasToBeInt(options, CONSTANTS.ATTR_ID_GENERATION);
        return true;
      }

      // If we don't have any attributes available for creating a new
      // generation, don't create one.
      if(!options[CONSTANTS.ATTR_NAME_GENERATION] &&
         !options[CONSTANTS.ATTR_PARENTS_GENERATION] &&
         !options[CONSTANTS.ATTR_DESCRIPTION_GENERATION]) {
        return true;
      }
    }*/

    Utils.hasToBeSet(options, CONSTANTS.ATTR_NAME_GENERATION);

    Utils.hasToBeString(options, CONSTANTS.ATTR_NAME_GENERATION);
    Utils.hasToBeIntArray(options, CONSTANTS.ATTR_PARENTS_GENERATION);
    Utils.hasToBeString(options, CONSTANTS.ATTR_DESCRIPTION_GENERATION);
  }

  /**
   * Because we have to generation and generation parents seperately, we want
   * to do this in a transaction so we can rollback if the second executed
   * query fails and no generation will be inserted.
   * @async
   * @param  {object} self
   *         Namespace/object only for the context of this class and this
   *         creation process. Not shared across differenct classes in
   *         callStack.
   * @param  {object} context
   *         Namespace/object of this creation process. It's shared across
   *         all classes in callStack.
   * @throws {Error}
   *         Throws unexpected sqlite errors or errors thrown from
   *         executeQueryInsertParentsIfNeeded().
   */
  async insert(self, context, transaction) {
    try {
      await super.insert(self, context, transaction);
    } catch(err) {
      if (err.code === 'SQLITE_CONSTRAINT') {
        throw new Error('options.familyId does not reference an existing Family');
      }
      throw err;
    }

    // No parents, nothing to do
    if (!self.insertParents) return;

    // parent ids need to be in a seperate table, so build row array for that
    // query
    let insertParentRows = [];
    for(let parentPlantId of context.options.generationParents) {
      insertParentRows.push({
        parentId: null,
        generationId: context.insertIds[this.constructor.ATTR_ID],
        plantId: parentPlantId
      });
    }    
    try {
      await transaction
        .insert(self.insertParentRows)
        .into(this.constructor.TABLE_PARENTS);
    } catch (err) {
      if (err.code === 'SQLITE_CONSTRAINT') {
        throw new Error('options.generationParents contains at least one plantId which does not reference an existing plant');
      }
      throw err;
    }
  }
}

GenerationAdd.PARENT = 'Family';

GenerationAdd.TABLE = CONSTANTS.TABLE_GENERATION;

GenerationAdd.TABLE_PARENTS = CONSTANTS.TABLE_GENERATION_PARENT;

GenerationAdd.ATTR_ID = CONSTANTS.ATTR_ID_GENERATION;

GenerationAdd.ATTR_ADDED_AT = CONSTANTS.ATTR_ADDED_AT_GENERATION;

GenerationAdd.ATTR_MODIFIED_AT = CONSTANTS.ATTR_MODIFIED_AT_GENERATION;

GenerationAdd.ATTR_FILL_CHILD_IDS = CONSTANTS.ATTR_GENOTYPES_GENERATION;

GenerationAdd.ATTR_CHILD_ID = CONSTANTS.ATTR_ID_GENOTYPE;

GenerationAdd.ATTRIBUTES = CONSTANTS.ATTRIBUTES_GENERATION;

GenerationAdd.SKIP_ATTRIBUTES = [
  CONSTANTS.ATTR_PARENTS_GENERATION,
  CONSTANTS.ATTR_GENOTYPES_GENERATION
];

GenerationAdd.PLURAL = CONSTANTS.PLURAL_GENERATION;

GenerationAdd.DEFAULT_VALUES_ATTRIBUTES = {
  [CONSTANTS.ATTR_DESCRIPTION_GENERATION]: '',
  [CONSTANTS.ATTR_PARENTS_GENERATION]: [],
  [CONSTANTS.ATTR_GENOTYPES_GENERATION]: []
};

module.exports = GenerationAdd;
