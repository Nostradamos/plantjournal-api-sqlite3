'use strict';

const _ = require('lodash');
const squel = require('squel');
const sqlite = require('sqlite');

const logger = require('../logger');
const Utils = require('../utils');
const QueryUtils = require('../utils-query');
const QueryUtilsApplyFilter = require('../utils-query-apply-filter');

/**
 * Generic Delete class which tries to build a skeleton for all
 * delete classes (eg plant-delete, genotype-delete...). They
 * all base (and extend) this class. We try to do at most general
 * stuff as possible in this class to prevent the same code in all
 * the delete functions again and again.
 * The only function which should get called from the outside is the
 * #delete() function.
 * To change the behaviour of one of the delete classes (or create a
 * new one) simply extend this class and overwrite the different
 * static class methods like #initQueryRelated(), #extractIdsToDelete()
 * etc. See method comments for further and more detailed information.
 * @private
 */
class GenericDelete {
    /**
   * This method executes the whole delete process. You can define
   * which entries should get deleted with the criteria object.
   * This method should get called from you api.
   * @async
   * @param  {object}  [criteria={}]
   *         Criterias for find
   * @param  {string[]} [criteria.attributes]
   *         Specify the attributes to query and return. Eg: [familyName,
   *         generationName]
   * @param  {object} [criteria.filter]
   *         Object which contains
   * @param  {integer} [criteria.offset]
   *         Skip the first x results
   * @param  {integer} [criteria.limit]
   *         limit to x results
   * @throws {Error}
   *         Should only throw unexpected sqlite errors.
   * @return {Object}
   *         Array of ids from deleted entries.
   */
    static async delete(criteria) {
        Utils.throwErrorIfNotConnected();
        if (_.isNil(criteria)) throw Error('No criteria object passed');
        logger.debug(this.name, ' #delete() criteria:', criteria);
        let context = {};

        this.initQueryRelated(context, criteria);
        this.setQueryRelatedJoin(context, criteria);
        this.setQueryRelatedFields(context, criteria);
        this.setQueryRelatedWhere(context, criteria);
        this.setQueryRelatedLimitAndOffset(context, criteria);
        this.setQueryRelatedOrder(context, criteria);
        this.stringifyQueryRelated(context, criteria);

        await this.executeQueryRelated(context, criteria);

        this.extractIdsToDelete(context, criteria);

        this.initQueryDelete(context, criteria);
        this.setQueryDeleteWhere(context, criteria);
        this.stringifyQueryDelete(context, criteria);

        await this.executeQueryDelete(context, criteria);

        let returnObject = {};
        this.buildReturnObject(returnObject, context, criteria);
        logger.log(this.name, '#delete() returnObject:', returnObject);

        return returnObject;

    }

    /**
   * Inits the queryRelated query by creating a new squel query builder
   * object. To change the table from which should get selected, simply
   * overwrite/set GenericDelete.TABLE.
   * Normally there should be no need to overwrite this method.
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to delete()
   */
    static initQueryRelated(context, criteria) {
        context.queryRelated = squel
            .select()
            .from(this.TABLE, this.TABLE);
    }

    /**
   * In case you want to join related tables, overwrite this function.
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to delete()
   */
    static setQueryRelatedJoin(context, criteria) {

    }

    /**
   * Overwrite this method to set all attributes you want to select for
   * the queryRelated query. Normally this should be all id attributes which
   * reference other entries, which should get deleted too, or get deleted
   * because the table cascade (ON DELETE CASCADE).
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to delete()
   */
    static setQueryRelatedFields(context, criteria) {

    }

    /**
   * Applies {@link QueryUtilsApplyFilter} to context.queryRelated. Normally
   * you shouldn't have to overwrite this, to change the queryable
   * attributes simply set GenericDelete.ATTRIBUTES_SEARCHABLE.
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to delete()
   */
    static setQueryRelatedWhere(context, criteria) {
        QueryUtilsApplyFilter(context.queryRelated, this.ATTRIBUTES_SEARCHABLE, criteria);
    }

    /**
   * Sets limit and offset for context.queryRelated. No need to overwrite
   * normally.
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to delete()
   */
    static setQueryRelatedLimitAndOffset(context, criteria) {
        QueryUtils.setLimitAndOffset(context.queryRelated, criteria);
    }

    /**
     * Takes sort instructions from criteria and applies them to queryRelated.
     * @param  {object} context
     *         Internal context object
     * @param  {object} criteria
     *         Criteria object passed to delete()
     */
    static setQueryRelatedOrder(context, criteria) {
        QueryUtils.applyCriteriaSort(
            context.queryRelated, this.ATTRIBUTES_SEARCHABLE, criteria
        );
    }


    /**
   * Builds the query string from the query builder and logs the
   * query. No need to overwrite.
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to delete()
   */
    static stringifyQueryRelated(context, criteria) {
        context.queryRelated = context.queryRelated.toString();
        logger.debug(this.name, '#delete() queryRelated:', context.queryRelated);
    }

    /**
   * Executes queryRelated asynchronously. No need to overwrite.
   * All selected rows will be in context.rowsRelated
   * @async
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to delete()
   * @throws {Error}
   *         All sqlite errors, we don't catch anything. Overwrite method
   *         and execute super method in try/catch block to catch errors.
   */
    static async executeQueryRelated(context, criteria) {
        context.rowsRelated = await sqlite.all(context.queryRelated);
        logger.debug(this.name, '#delete() rowsRelated:', context.rowsRelated);
    }

    /**
   * To extract all the ids which get deleted (or should get deleted)
   * overwrite this function. Simply overwrite this method and iterate
   * over context.rowsRelated and extract needed information.
   * Save ids in context.{NAME}IdsToDelete.
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to delete()
   */
    static extractIdsToDelete(context, criteria) {
    }

    /**
   * Init context.queryDelete squel query for the actual delete
   * query. No need to overwrite, simply change GenericDelete.TABLE
   * to the table name
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to delete()
   */
    static initQueryDelete(context, criteria) {
        context.queryDelete = squel
            .delete()
            .from(this.TABLE);
    }

    /**
   * Set filter for queryDelete. Normally which entry ids
   * should get deleted.
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to delete()
   */
    static setQueryDeleteFilter(context, criteria) {
    }

    /**
   * Stringifies queryDelete and logs the query string.
   * No need to overwrite.
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to delete()
   */
    static stringifyQueryDelete(context, criteria) {
        context.queryDelete = context.queryDelete.toString();
        logger.debug(this.name, '#delete() queryDelete:', context.queryDelete);
    }

    /**
   * Executes queryDelete and puts result into context.resultDelete.
   * Logs results too. No need to overwrite.
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to delete()
   */
    static async executeQueryDelete(context, criteria) {
        context.resultDelete = await sqlite.get(context.queryDelete);
        logger.debug(this.name, '#delete() resultDelete', context.resultDelete);
    }

    /**
   * Add all properties you want to have in your returnObject here.
   * This should contain all ids for the different models which got
   * deleted.
   * @param  {object} returnObject
   *         returnObject, an empty assoc array which will get returned at the
   *         end of #delete()
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to delete()
   */
    static async buildReturnObject(returnObject, context, criteria) {

    }


}

// Table name for all init queries like selecting the related ids and deleting
// from.
GenericDelete.TABLE;

// Array containing all allowed ALIASES which can we use in our WHERE part.
GenericDelete.ATTRIBUTES_SEARCHABLE;

module.exports = GenericDelete;
