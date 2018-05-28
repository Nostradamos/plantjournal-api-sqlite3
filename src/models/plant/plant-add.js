'use strict';

const _ = require('lodash');

const AbstractModelAdd = require('../abstract/abstract-model-add');
const CONSTANTS = require('../../constants');
const Utils = require('../../utils/utils');

/**
 * PlantAdd Class which creates a new Plant.
 * Gets internally called from Plant.add(). If you want
 * to know how Create works internally, see
 * src/controller/generic-add.
 * If you want to know how to use the Plant.add()
 * API from outside, see src/models/Plant #create().
 * @private
 * @extends GenericAdd
 */
class PlantAdd extends AbstractModelAdd {

  _resolveParentClasses() {
    super._resolveParentClasses();
    this.RELATED_INSTANCES2 = this._resolveParentClassesFor(this.constructor.PARENT2);
    
		this.logger.debug(`${this.constructor.name} RELATED_INSTANCES2: ${this.RELATED_INSTANCES2.map((instance) => instance.constructor.name)}`);
  }

  callAllValidateMethods(context) {
    return [
      ...super._callAllValidateMethods(context, this.RELATED_INSTANCES),
      ...super._callAllValidateMethods(context, this.RELATED_INSTANCES2)
    ];

  }
  /**
   * We need to validate input and throw errors if we're unhappy with it.
   * @param  {object} self
   *         Namespace/object only for the context of this class and this
   *         creation process. Not shared across differenct classes in
   *         classStack.
   * @param  {object} context
   *         Namespace/object of this creation process. It's shared across
   *         all classes in classStack.
   * @throws {Error}
   */
  validate(context) {
    let options = context.options;

    Utils.hasToBeSet(options, 'plantName');
    Utils.hasToBeString(options, 'plantName');
    Utils.hasToBeInt(options, 'plantClonedFrom');
    Utils.hasToBeInt(options, 'environmentId');

    // plantSex has to be either male, female or hermaphrodite
    if (_.has(options, 'plantSex') &&
        _.indexOf(CONSTANTS.PLANT_SEXES, options.plantSex) === -1) {
      throw new Error('options.plantSex has to be null, male, female or hermaphrodite');
    }
  }

  /**
   * It's possible we need to create a genotype for this plant. If this is the
   * case we have to create genotype before plant. To undo the insert of
   * genotype if shit happens, we need to do this in a transaction.
   * @async
   * @param  {object} self
   *         Namespace/object only for the context of this class and this
   *         creation process. Not shared across differenct classes in
   *         classStack.
   * @param  {object} context
   *         Namespace/object of this creation process. It's shared across
   *         all classes in classStack.
   * @throws {Error}
   *         Any errors from #createGenotypeOrResolveGenotypeIdIfNeeded() or
   *         #executeQueryInsertPlant() or unexpected sqlite errors.
   */
  async insert(self, context, transaction) {
    if(context.options.plantClonedFrom &&
       _.isUndefined(context.insertIds['genotypeId']) &&
       _.isUndefined(context.options['genotypeId'])) {
      // Retrieve the genotypeId of the mother plant
      this.logger.debug(`${this.constructor.name} #insert() checking if plantClonedFrom is an existing plant`);
      let result = await transaction.raw(
        `SELECT plants.genotypeId FROM plants WHERE plants.plantId = ?`,
        [context.options.plantClonedFrom]);
 
      if(result.length === 0) {
        throw new Error('options.plantClonedFrom does not reference an existing Plant');
      }

      context.insertIds['genotypeId'] = result[0]['genotypeId'];
    }

    try {
      await super.insert(self, context, transaction);
    } catch (err) {
      // We only have one foreign key so we can safely assume, if a
      // foreign key constraint fails, it's the generationId constraint.
      if (err.code === 'SQLITE_CONSTRAINT') {
        this.logger.error(`${this.constructor.name} #insert() Error:`, err);
        throw new Error('options.genotypeId does not reference an existing Genotype');
      }
      throw err;
    }
  }

  insertSetPreviouslyCreatedIds(self, context) {
    super.insertSetPreviouslyCreatedIds(self, context);

    if(this.constructor.PARENT2) {
      let parentAttrId = this.plantJournal[this.constructor.PARENT2].INSTANCE_ADD.constructor.ATTR_ID;
      let parentId = null;
      if(context.insertIds[parentAttrId]) {
        parentId = context.insertIds[parentAttrId];
      } else if(context.options[parentAttrId]) {
        parentId = context.options[parentAttrId];
      }
      self.insertRow[parentAttrId] = parentId;
    }
  }
}

PlantAdd.PARENT = 'Genotype';

PlantAdd.PARENT2 = 'Medium';

PlantAdd.TABLE = CONSTANTS.TABLE_PLANT;

PlantAdd.ATTR_ID = CONSTANTS.ATTR_ID_PLANT;

PlantAdd.ATTR_ADDED_AT = CONSTANTS.ATTR_ADDED_AT_PLANT;

PlantAdd.ATTR_MODIFIED_AT = CONSTANTS.ATTR_MODIFIED_AT_PLANT;

PlantAdd.ATTRIBUTES = CONSTANTS.ATTRIBUTES_PLANT;

PlantAdd.SKIP_ATTRIBUTES = [
  CONSTANTS.ATTR_CLONES_PLANT
];

PlantAdd.DEFAULT_VALUES_ATTRIBUTES = {
  [CONSTANTS.ATTR_DESCRIPTION_PLANT]: '',
  [CONSTANTS.ATTR_ID_MEDIUM]: null,
  [CONSTANTS.ATTR_CLONES_PLANT]: []
};

PlantAdd.PLURAL = CONSTANTS.PLURAL_PLANT;

module.exports = PlantAdd;
