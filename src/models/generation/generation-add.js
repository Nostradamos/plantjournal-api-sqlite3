'use strict';

const _ = require('lodash');
const squel = require('squel');

const CONSTANTS = require('../../constants');
const logger = require('../../logger');
const Utils = require('../../utils/utils');

const GenericAdd = require('../generic/generic-add');
const FamilyAdd = require('../family/family-add');

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
class GenerationAdd extends GenericAdd {

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
  static validate(self, context) {
    let options = context.options;

    // Some additional validations if we got called from a child class
    if(context.creatingClassName !== this.name) {
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
    }

    Utils.hasToBeSet(options, CONSTANTS.ATTR_NAME_GENERATION);

    Utils.hasToBeString(options, CONSTANTS.ATTR_NAME_GENERATION);
    Utils.hasToBeIntArray(options, CONSTANTS.ATTR_PARENTS_GENERATION);
    Utils.hasToBeString(options, CONSTANTS.ATTR_DESCRIPTION_GENERATION);

    self.insertParents = !_.isEmpty(options.generationParents);
  }

  /**
   * We need to insert parent plants into a seperate table, we will do this
   * here.
   * @param  {object} self
   *         Namespace/object only for the context of this class and this
   *         creation process. Not shared across differenct classes in
   *         callStack.
   * @param  {object} context
   *         Namespace/object of this creation process. It's shared across
   *         all classes in callStack.
   */
  static initQuery(self, context) {
    super.initQuery(self, context);

    // No parents, nothing to do
    if (!self.insertParents) return;

    // for every plant we have to insert a own row.
    let attributesRows = [];
    for(let parentPlantId of context.options.generationParents) {
      attributesRows.push({
        parentId: null,
        generationId: squel.rstr('$generationId'),
        plantId: parentPlantId
      });
    }

    // build and stringify query
    self.queryParents = squel.insert().into(this.TABLE_PARENTS)
      .setFieldsRows(attributesRows)
      .toString();

    logger.debug(this.name, '#create() queryParents:', self.queryParents);
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
  static async executeQuery(self, context) {
    try {
      await super.executeQuery(self, context);
    } catch(err) {
      if (err.message === 'SQLITE_CONSTRAINT: FOREIGN KEY constraint failed') {
        throw new Error('options.familyId does not reference an existing Family');
      }
      throw err;
    }

    // No parents, nothing to do
    if (!self.insertParents) return;


    try {
      let placeholders = {$generationId: self.insertId};
      await super._executeQuery(self, context, self.queryParents, placeholders);
    } catch (err) {
      if (err.message === 'SQLITE_CONSTRAINT: FOREIGN KEY constraint failed') {
        throw new Error('options.generationParents contains at least one plantId which does not reference an existing plant');
      }
      throw err;
    }
  }
}

GenerationAdd.PARENT = FamilyAdd;

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
