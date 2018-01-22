'use strict';

const _ = require('lodash');
const sqlite = require('sqlite');

const CONSTANTS = require('../../constants');
const logger = require('../../logger');
const Utils = require('../../utils/utils');
const Genotype = require('../../models/genotype');

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
     * @param  {object} context
     *         internal context object in #create().
     * @param  {object} options
     *         options object which got passed to GenericCreate.create().
     * @throws {Error}
     */
  static validate(self, context) {
    let options = context.options;

    Utils.hasToBeSet(options, 'plantName');
    Utils.hasToBeString(options, 'plantName');
    Utils.hasToBeInt(options, 'plantClonedFrom');
    Utils.hasToBeInt(options, 'genotypeId');
    Utils.hasToBeInt(options, 'generationId');
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
   * @param  {object} context
   *         internal context object in #create().
   * @param  {object} options
   *         options object which got passed to GenericCreate.create().
   * @throws {Error}
   *         Any errors from #createGenotypeOrResolveGenotypeIdIfNeeded() or
   *         #executeQueryInsertPlant() or unexpected sqlite errors.
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
