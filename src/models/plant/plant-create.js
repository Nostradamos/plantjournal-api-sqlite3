'use strict';

const _ = require('lodash');
const sqlite = require('sqlite');

const CONSTANTS = require('../../constants');
const Utils = require('../../utils/utils');

const GenericCreate = require('../generic/generic-create');
const GenotypeCreate = require('../genotype/genotype-create');
const MediumCreate =require('../medium/medium-create');


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
   * We need to resolve selfs/classStack for Genotype and it's parents and
   * also for Medium and it's parents. Therefore we now also return a
   * classStackAndSelfs object with two selfs and two classStack properties.
   * @param  {Object}  context
   *         Context object for this insert/create request.
   * @return {{selfs: Object[], classStack: Object[],
   *           selfs2: Object[], classStack2: Object[]}} classStackAndSelfs
   *         Returns an object with four properties:
   *         selfs property is the selfs object of PlantCreate, GenotypeCreate
   *         and it's parents.
   *         classStack property is the classStack for PlantCreate,
   *         GenotypeCreate and it's parents.
   *         selfs2 property is the selfs object of MediumCreate and it's
   *         parents (EnvironmentCreate).
   *         classStack2 property is the classStack array of MediumCreate and
   *         it's parents (EnvironmentCreate).
   */
  static resolveClassStackAndBuildSelfs(context) {
    let [selfs, classStack] = Utils.getSelfsAndClassStack(this);
    let [selfs2, classStack2] = Utils.getSelfsAndClassStack(this.PARENT2);

    return {selfs, classStack, selfs2, classStack2};
  }

  /**
   * This method calls the validate methods for classStack and classStack2 and
   *  merges them again into one selfs/classStack object and returns them.
   * @param {{selfs: Object[], classStack: Object[],
   *         selfs2: Object[], classStack2: Object[]}} classStackAndSelfs
   *         The classStackAndSelfs object returned from
   *         PlantCreate.resolveClassStackAndBuildSelfs()
   * @param  {Object}  context
   *         Context object for this insert/create request.
   * @return {classStackAndSelfs}
   *         classStackAndSelfs object
   */
  static async callClassStackValidationMethods(classStackAndSelfs, context) {
    let [selfs2, classStack2] = [
      classStackAndSelfs.selfs2,
      classStackAndSelfs.classStack2
    ];
    let classStackAndSelfs2 = {selfs: selfs2, classStack: classStack2};
    classStackAndSelfs2 = await this.PARENT2.callClassStackValidationMethods(
      classStackAndSelfs2, context);

    classStackAndSelfs = await super.callClassStackValidationMethods(
      classStackAndSelfs, context);

    return {
      selfs: [
        ...classStackAndSelfs2.selfs,
        ...classStackAndSelfs.selfs
      ],
      classStack: [
        ...classStackAndSelfs2.classStack,
        ...classStackAndSelfs.classStack
      ]
    };
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

PlantCreate.PARENT = GenotypeCreate;

PlantCreate.PARENT2 = MediumCreate;

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
