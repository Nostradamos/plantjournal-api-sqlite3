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
    this.RELATED_INSTANCES = [
			this,
			 ...this._resolveParentClassesFor(this.constructor.PARENT)];
    
		this.logger.debug(`${this.constructor.name} RELATED_INSTANCES: ${this.RELATED_INSTANCES.map((instance) => instance.constructor.name)}`);
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
  validate(self) {
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
  static async executeQuery(self, context) {
    if(context.options.plantClonedFrom &&
       _.isUndefined(context.insertIds['genotypeId']) &&
       _.isUndefined(context.options['genotypeId'])) {
      // Retrieve the genotypeId of the mother plant
      let result = await sqlite.get(
        `SELECT plants.genotypeId FROM plants WHERE plants.plantId = ?`,
        context.options.plantClonedFrom);

      if(_.isUndefined(result)) {
        await this.rollbackTransaction(self, context);
        throw new Error('options.plantClonedFrom does not reference an existing Plant');
      }

      context.insertIds['genotypeId'] = result['genotypeId'];
    }

    try {
      await super.executeQuery(self, context);
    } catch (err) {
      // We only have one foreign key so we can safely assume, if a
      // foreign key constraint fails, it's the generationId constraint.
      if (err.message === 'SQLITE_CONSTRAINT: FOREIGN KEY constraint failed') {
        throw new Error('options.genotypeId does not reference an existing Genotype');
      }
      throw err;
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
