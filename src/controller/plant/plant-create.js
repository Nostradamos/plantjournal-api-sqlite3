'use strict';

const _ = require('lodash');
const sqlite = require('sqlite');

const CONSTANTS = require('../../constants');
const Utils = require('../../utils/utils');

const GenericCreate = require('../generic/generic-create');
const GenotypeCreate = require('../genotype/genotype-create');


/**
 * PlantCreate Class which creates a new Plant.
 * Gets internally called from Plant.create(). If you want
 * to know how Create works internally, see
 * src/controller/generic-create.
 * If you want to know how to use the Plant.create()
 * API from outside, see src/models/Plant #create().
 * @private
 * @extends GenericCreate
 */
class PlantCreate extends GenericCreate {

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
     */
  static validate(self, context) {
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
   *         callStack.
   * @param  {object} context
   *         Namespace/object of this creation process. It's shared across
   *         all classes in callStack.
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

      context['genotypeId'] = context.lastInsertId = result['genotypeId'];
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

PlantCreate.PARENT = GenotypeCreate;

PlantCreate.TABLE = CONSTANTS.TABLE_PLANT;

PlantCreate.ATTR_ID = CONSTANTS.ATTR_ID_PLANT;

PlantCreate.ATTR_CREATED_AT = CONSTANTS.ATTR_CREATED_AT_PLANT;

PlantCreate.ATTR_MODIFIED_AT = CONSTANTS.ATTR_MODIFIED_AT_PLANT;

PlantCreate.ATTRIBUTES = CONSTANTS.ATTRIBUTES_PLANT;

PlantCreate.SKIP_ATTRIBUTES = [
  CONSTANTS.ATTR_CLONES_PLANT
];

PlantCreate.DEFAULT_VALUES_ATTRIBUTES = {
  [CONSTANTS.ATTR_DESCRIPTION_PLANT]: '',
  [CONSTANTS.ATTR_ID_MEDIUM]: null,
  [CONSTANTS.ATTR_CLONES_PLANT]: []
};

PlantCreate.PLURAL = CONSTANTS.PLURAL_PLANT;

module.exports = PlantCreate;
