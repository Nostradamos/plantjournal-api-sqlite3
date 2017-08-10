'use strict';

const _ = require('lodash');

const CONSTANTS = require('../constants');
const Utils = require('../utils');
const QueryUtils = require('../utils-query');

const GenericFind = require('./generic-find');

/**
* GenotypeFind does all the functionality of Genotype.find
* To manually execute a "GenotypeFind-find", call GenotypeFind.find().
* To understand how finds work generally internally, See
* src/controller/generic-find (we extend that class).
* If you want to know how to use the Genotype.find() API, See
* src/models/genotype #find().
* @private
* @extends GenericFind
 */
class GenotypeFind extends GenericFind {

    /**
   * We need to join both generation and families to make it possible to find
   * genotypes based on familyName, familyId, generationName etc. This basically
   * enforces us to query every field of generations or families.
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to find()
   */
    static setQueryWhereJoin(context, criteria) {
        QueryUtils.joinRelatedGenotypes(context.queryWhere);
    }

    /**
   * Build the returnObject. We want to have all genotype attributes (like
   * genotypeName etc) in returnObject.genotypes, all family attributes
   * (like familyName, familyId) inreturnObject.families and all
   * generation attributes in returnObject.generations.
   * @param  {object} returnObject
   *         object which will get returned later from #find().
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to find()
   */
    static buildReturnObjectWhere(returnObject, context, criteria) {
        returnObject.genotypes = {};
        returnObject.generations = {};
        returnObject.families = {};
        _.each(context.rowsWhere, function(row) {
            Utils.addGenotypeFromRowToReturnObject(row, returnObject, criteria, true);
            Utils.addGenerationFromRowToReturnObject(row, returnObject, criteria);
            Utils.addFamilyFromRowToReturnObject(row, returnObject, criteria);
        });
        Utils.deleteEmptyProperties(returnObject, ['families', 'generations']);
    }
}

GenotypeFind.TABLE = CONSTANTS.TABLE_GENOTYPES;

GenotypeFind.ATTR_ID = CONSTANTS.ATTR_ID_GENOTYPE;

GenotypeFind.ATTRIBUTES_SEARCHABLE = CONSTANTS.RELATED_ATTRIBUTES_GENOTYPE;

GenotypeFind.ALIASES_TO_FIELD_WITHOUT_ID = _.merge(
    {},
    CONSTANTS.ALIASES_TO_FIELD_WITHOUT_ID_FAMILY,
    CONSTANTS.ALIASES_TO_FIELD_WITHOUT_ID_GENERATION,
    CONSTANTS.ALIASES_TO_FIELD_WITHOUT_ID_GENOTYPE
);

GenotypeFind.DEFAULT_FIELDS = ['genotypes.genotypeId', 'generations.generationId', 'families.familyId'];

GenotypeFind.COUNT = 'DISTINCT ' + CONSTANTS.TABLE_GENERATIONS + '.' + CONSTANTS.ATTR_ID_GENERATION;

GenotypeFind.GROUP_BY = CONSTANTS.TABLE_GENERATIONS + '.' + CONSTANTS.ATTR_ID_GENERATION;

module.exports = GenotypeFind;
