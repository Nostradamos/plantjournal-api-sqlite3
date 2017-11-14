'use strict';

const UtilsQuery = require('../../utils/utils-query');

const CONSTANTS = require('../../constants');
const GenericUpdate = require('../generic/generic-update');

/**
 * GenotypeUpdate Class. Basically does the update() stuff for
 * Genotypes. See GenericUpdate for more detailed information
 * on internal update process. For API usage see
 * src/model/Genotype #update().
 * @private
 * @extends GenericUpdate
 */
class GenotypeUpdate extends GenericUpdate {

  /**
     * We need to join some tables to make all ATTRIBUTES_SEARCHABLE of genotype
     * work.
     * @param  {object} context   - Internal context object
     * @param  {object} update    - Updated object passed to update()
     * @param  {object} criteria  - Criteria object passed to update()
     */
  static setQueryFindJoin(context, update, criteria) {
    UtilsQuery.joinRelatedGenotypes(context.queryFind);
  }

  /**
     * We need to catch sqlite constraint error and throw our
     * own error for this.
     * @param  {object} context   - Internal context object
     * @param  {object} update    - Updated object passed to update()
     * @param  {object} criteria  - Criteria object passed to update()
     */
  static async executeQueryUpdate(context, update, criteria) {
    try {
      await super.executeQueryUpdate(context, update, criteria);
    } catch (err) {
      if (err.message === 'SQLITE_CONSTRAINT: FOREIGN KEY constraint failed') {
        throw new Error('update.generationId does not reference an existing Generation');
      }
      throw err;
    }
  }
}

GenotypeUpdate.TABLE = CONSTANTS.TABLE_GENOTYPE;

GenotypeUpdate.ATTR_ID = CONSTANTS.ATTR_ID_GENOTYPE;

GenotypeUpdate.ATTR_MODIFIED_AT = CONSTANTS.ATTR_MODIFIED_AT_GENOTYPE;

GenotypeUpdate.ATTRIBUTES_SEARCHABLE = CONSTANTS.RELATED_ATTRIBUTES_GENOTYPE;

GenotypeUpdate.ATTRIBUTES_UPDATABLE = CONSTANTS.ATTRIBUTES_GENOTYPE;

module.exports = GenotypeUpdate;
