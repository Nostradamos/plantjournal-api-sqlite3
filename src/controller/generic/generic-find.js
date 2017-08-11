'use strict';

const _ = require('lodash');
const squel = require('squel');
const sqlite = require('sqlite');

const logger = require('../../logger');
const Utils = require('../../utils');
const QueryUtils = require('../../utils-query');
const QueryUtilsApplyCriteriaFilter = require('../../utils-query-apply-criteria-filter');

/**
 * Generic find class which is the skeleton for all *find methods
 * (eg. Plant.find, Genotype.find...). This class holds a lot of default behaviour
 * and can get modified to achieve the wanted find behaviour.
 * The only function which should get called from outside is the #find()
 * function. The #find() function calls all the different methods this class
 * holds in in series. To change the behaviour of your find, extend this class
 * and overwrite the best matching method. See method comments for further and
 * more detailed information.
 * @private
 */
class GenericFind {
    /**
     * This method takes care of the execution of the whole find process.
     * Your api calls this function.
     * @async
     * @param  {object}  [criteria={}]
     *         Criterias for find
     * @param  {string[]} [criteria.attributes]
     *         Specify the attributes to query and return.
     *         Eg: [familyName, generationName]
     * @param  {object} [criteria.filter]
     *         Object which contains
     * @param  {integer} [criteria.offset]
     *         Skip the first x results
     * @param  {integer} [criteria.limit]
     *         limit to x results
     * @throws {Error}
     *         Only throws errors if something unexpected happens with sqlite.
     * @return {Object}
     *         returnObject which by default only contains how many entries where
     *         found (count) and how many are left (remaining). You can modify the
     *         content by overwriting #buildReturnObjectWhere() method.
     *         A returnObject should look like this:
     *         {
     *           count: 42,
     *           remaining: 13,
     *           families: {
     *             1: {
     *               familyId: 1,
     *               familyName: 'TestFamily'
     *             },
     *             2: {
     *               familyId: 2,
     *               familyName: 'TestFamily2'
     *             }
     *           },
     *           generations: {
     *             1: {
     *               generationId: 1,
     *               generationName: 'F1',
     *               familyId: 1
     *             },
     *             2: {
     *               generationId: 2,,
     *               generationName: 'S1',
     *               familyId: 2
     *             }
     *           }
     *         }
     */
    static async find(criteria) {
        Utils.throwErrorIfNotConnected();
        if (_.isNil(criteria)) criteria = {};
        logger.debug(this.name, ' #find() criteria:', criteria);
        let context = {};

        context.attributes = criteria.attributes || false;

        this.initQueries(context, criteria);
        this.setQueryWhereJoin(context, criteria);
        this.setQueryWhere(context, criteria);
        this.cloneQueryWhereIntoQueryCount(context, criteria);
        this.setQueryWhereDefaultFields(context, criteria);
        this.setQueryWhereAdditionalFields(context, criteria);
        this.setQueryCountFields(context, criteria);
        this.setQueryWhereLimitAndOffset(context, criteria);
        this.setQueryWhereOrder(context, criteria);
        this.setQueryWhereGroup(context, criteria);

        this.stringifyQueries(context, criteria);
        await this.executeQueries(context, criteria);

        let returnObject = {};

        this.buildReturnObjectWhere(returnObject, context, criteria);
        this.buildReturnObjectCount(returnObject, context, criteria);

        logger.debug(this.name, '#find() returnObject:', returnObject);
        return returnObject;

    }

    /**
   * Init queries. Basically defines two properties in context
   * for queryWhere and queryCount. Besides that it sets
   * queryWhere to a select() and table to this.TABLE.
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to find()
   */
    static initQueries(context, criteria) {
    // Init queries, we need two query objects, because we need a subquery which
    // counts the total rows we could find for this query. Basically the counting
    // query ignores the limit part and uses the COUNT() function in sqlite.
    // To make it easier we first set everything which is the same for both queries
    // to queryWhere and clone it into queryCount. So we have to do things only once.
        context.queryWhere = squel.select().from(this.TABLE, this.TABLE);
        context.queryCount;
    }

    /**
   * In case you have to join some tables, overwrite this function and
   * apply joins to context.queryWhere.
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to find()
   */
    static setQueryWhereJoin(context, criteria) {
    }

    /**
   * This method just applies {@link QueryUtilsApplyCriteriaFilter} to the context.queryWhere query.
   * Normally you shouldn't overwrite this, you can use this.ATTRIBUTES_SEARCHABLE to
   * adjust the behaviour.
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to find()
   */
    static setQueryWhere(context, criteria) {
        QueryUtilsApplyCriteriaFilter(
            context.queryWhere,
            this.ATTRIBUTES_SEARCHABLE,
            criteria,
            this.OVERWRITE_TABLE_LOOKUP
        );
    }

    /**
   * Clones queryWhere into queryCount. So everything applied to
   * context.queryWhere before this gets called will also be in
   * context.queryCount.
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to find()
   */
    static cloneQueryWhereIntoQueryCount(context, criteria) {
        context.queryCount = context.queryWhere.clone();
    }

    /**
   * Sets attributes to select for queryWhere to this.ATTR_ID if this.DEFAULT_FIELDS
   * is not set. Otherwise all attributes of this.DEFAULT_FIELDS will get selected.
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to find()
   */
    static setQueryWhereDefaultFields(context, criteria) {
    // For queryWhere we always have to set familyId, because it's needed
    // for the object key.
        if (_.isEmpty(this.DEFAULT_FIELDS)) {
            context.queryWhere.field(this.TABLE + '.' + this.ATTR_ID);
        } else {
            context.queryWhere.fields(this.DEFAULT_FIELDS);
        }
    }

    /**
   * Applies {@link QueryUtils.applyCriteriaAttributes} to context.queryWhere.
   * Normally you shouldn't overwrite this function.
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to find()
   */
    static setQueryWhereAdditionalFields(context, criteria) {
    // We only have to set attributes specified if options.attributes, otherwise all.
        QueryUtils.applyCriteriaAttributes(
            context.queryWhere,
            this.ATTRIBUTES_SEARCHABLE,
            criteria.attributes,
            this.OVERWRITE_TABLE_LOOKUP
        );
    }

    /**
   * Sets the count field for queryCount. If this.COUNT is not set, we will
   * use this.ATTR_ID. If you need to distinct the ids, just set:
   * this.COUNT = 'distinct(sometable.someIdField)'
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to find()
   */
    static setQueryCountFields(context, criteria) {
        context.queryCount.field(
            'count(' + (_.isEmpty(this.COUNT) ? this.TABLE + '.' + this.ATTR_ID : this.COUNT) + ')',
            'count'
        );
    }

    /**
   * Sets limit and offset for queryWhere.
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to find()
   */
    static setQueryWhereLimitAndOffset(context, criteria) {
    // Set LIMIT and OFFSET for queryWhere (and only for queryWhere)
        QueryUtils.applyCriteriaLimitAndOffset(context.queryWhere, criteria);
    }

    /**
     * Takes sort instructions from criteria and applies them to queryWhere.
     * @param  {object} context
     *         Internal context object
     * @param  {object} criteria
     *         Criteria object passed to find()
     */
    static setQueryWhereOrder(context, criteria) {
        QueryUtils.applyCriteriaSort(
            context.queryWhere,
            this.ATTRIBUTES_SEARCHABLE,
            criteria,
            this.OVERWRITE_TABLE_LOOKUP
        );
    }

    /**
   * You need to group your queries? Just set this.GROUP_BY.
   * ToDo: Is this needed for any find*?
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to find()
   */
    static setQueryWhereGroup(context, criteria) {
        if (!_.isEmpty(this.GROUP_BY)) context.queryWhere.group(this.GROUP_BY);
    }

    /**
   * Stringfies both queries queryWhere and queryCount.
   * If you named them differently, overwrite this method.
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to find()
   */
    static stringifyQueries(context, criteria) {
    // Stringify queries
        context.queryWhere = context.queryWhere.toString();
        logger.debug(this.name, '#find() queryWhere:', context.queryWhere);
        context.queryCount = context.queryCount.toString();
        logger.debug(this.name, '#find() queryCount:', context.queryCount);
    }

    /**
   * Executes queryWhere and queryCount in parallel and puts the results
   * in context.rowsWhere and context.rowCount (mind the missing s on rowCount).
   * You shouldn't need to overwrite this method if you don't rename the
   * queries.
   * @async
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to find()
   * @throws {Error}
   *         Only throws errors if something unexpected happens with sqlite.
   */
    static async executeQueries(context, criteria) {
    // Now we will execute both queries and catch the results
        [context.rowsWhere, context.rowCount] = await Promise
            .all([sqlite.all(context.queryWhere), sqlite.get(context.queryCount)]);

        logger.debug(this.name, '#find() rowsWhere:', context.rowsWhere);
        logger.debug(this.name, '#find() rowCount:', context.rowCount);
    }

    /**
   * Apply all info from context.rowsWhere to returnObject here.
   * @param  {object} returnObject
   *         object which will get returned later from #find().
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to find()
   */
    static buildReturnObjectWhere(returnObject, context, criteria) {

    }

    /**
   * Applies all info from context.rowCount. So basically adds found
   * and remaining properties to returnObject. Normally no need to
   * overwrite this method.
   * @param  {object} returnObject
   *         object which will get returned later from #find().
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to find()
   */
    static buildReturnObjectCount(returnObject, context, criteria) {
        logger.debug(this.name, '#find() length RowsWhere:', context.rowsWhere.length);
        Utils.addFoundAndRemainingFromCountToReturnObject(
            context.rowCount,
            context.rowsWhere.length,
            returnObject,
            criteria
        );

    }
}

// Table name. Eg: families
GenericFind.TABLE;

// Array of all queryable aliases. Eg. ['familyId', 'familyName'...]
GenericFind.ATTRIBUTES_SEARCHABLE;

// Alias for id field. Eg. familyId
GenericFind.ATTR_ID;

// Overwrite inner value of count. If this is not set, we will just use count(ATTR_ID).
// It can make sense to set this to distinct(ATTR_ID) so that we do count(distinct...)
// in case your find query results multiple rows with the same id and you only want
// to count them once.
GenericFind.COUNT;

// You want to select more default attributes than just ATTR_ID? Set them here.
GenericFind.DEFAULT_FIELDS;

// You want to apply an GROUP BY to queryWhere? Overwrite this.
GenericFind.GROUP;

GenericFind.OVERWRITE_TABLE_LOOKUP = null;

module.exports = GenericFind;
