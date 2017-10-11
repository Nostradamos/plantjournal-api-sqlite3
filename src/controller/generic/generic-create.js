'use strict';

const _ = require('lodash');
const squel = require('squel');
const sqlite = require('sqlite');

const logger = require('../../logger');
const Utils = require('../../utils/utils');


/**
 * Generic create class which is the skeleton for all *-create classes.
 * It defines some general static methods which will called in a specific
 * order (see create()). Besides that this class also does some simple stuff
 * which most *-create classes would have to do too (eg. basic logging,
 * initing query object... )
 * @private
 */
class GenericCreate {

    /**
     * This function executes the complete create process.
     * In the best case, don't try to overwrite this method if you extend
     * GenericCreate. Prefer to overwrite any of the called child methods
     * (validateBefore, validate, ...buildReturnObject)
     * @async
     * @param {object} options
     *        Object which should hold enough information to create
     *        a new entry with.
     * @throws {Error}
     * @return {object} - returnObject, should normally contain information
     *                    about created record.
     */
    static async create(options) {
        Utils.throwErrorIfNotConnected();
        logger.debug(this.name, '#create() options:', options);
        let context = {};

        this.validateOptionsIsAssoc(context, options);
        this.validateOptions(context, options);

        this.initQuery(context, options);
        this.setQueryFields(context, options);
        this.setQueryCreatedAtAndModifiedAt(context, options);
        this.stringifyQuery(context, options);

        await this.executeQuery(context, options);

        let returnObject = {};

        this.buildReturnObject(returnObject, context, options);
        logger.debug(this.name, '#create() returnObject:', JSON.stringify(returnObject));

        return returnObject;
    }

    /**
     * Use this method for validating the options parameter itself. Normally
     * You should only make sure that it's an assoc array.
     * @param  {object} context
     *         internal context object in #create().
     * @param  {object} options
     *         options object which got passed to GenericCreate.create().
     */
    static validateOptionsIsAssoc(context, options) {
        Utils.hasToBeAssocArray(options);
    }

    /**
     * Overwrite this method to validate all properties in options.
     * Eg: making sure a property has a specific type or is set...
     * If something isn't valid, throw an error.
     * @param  {object} context
     *         internal context object in #create().
     * @param  {object} options
     *         options object which got passed to GenericCreate.create().
     */
    static validateOptions(context, options) {
    }

    /**
     * This function inits the context.query squel object.
     * By default it will be an insert query and the table will
     * be this.TABLE.
     * Overwrite this if you want to init more than one query or you're
     * not happy with the default behaviour.
     * @param  {object} context
     *         internal context object in #create().
     * @param  {object} options
     *         options object which got passed to GenericCreate.create().
     */
    static initQuery(context, options) {
        context.query = squel.insert().into(this.TABLE);
    }

    /**
     * We iterate over all this.ATTRIBUTES and look if we can get the
     * information from somewhere. We first look if attribute is set in context,
     * next if in options, next in DEFAULT_VALUES_ATTRIBUTES and if we still
     * didn't find it, set it to null. We also set the id field here.
     * @param  {object} context
     *         internal context object in #create().
     * @param  {object} options
     *         options object which got passed to GenericCreate.create().
     */
    static setQueryFields(context, options) {
        _.each(this.ATTRIBUTES, function(attr) {
            if (_.indexOf(this.SKIP_ATTRIBUTES, attr) !== -1) {
                return;
            } else if (!_.isUndefined(context[attr])) {
                context.query.set(attr, context[attr]);
            } else if (!_.isUndefined(options[attr])) {
                context.query.set(attr, options[attr]);
            } else if (!_.isUndefined(this.DEFAULT_VALUES_ATTRIBUTES[attr])) {
                context.query.set(attr, this.DEFAULT_VALUES_ATTRIBUTES[attr]);
            } else {
                context.query.set(attr, null);
            }
        }.bind(this));

        // set id field
        context.query.set(this.ATTR_ID, null);
    }

    /**
     * Set createdAt and modifedAt attributes to query.
     * Overwrite this if you have different query names or multiple queries.
     * For timestamp generation use ONCE Utils.getUnixTimestampUTC()
     * @param  {object} context
     *         internal context object in #create().
     * @param  {object} options
     *         options object which got passed to GenericCreate.create().
     */
    static setQueryCreatedAtAndModifiedAt(context, options) {
        context.createdAt = context.modifiedAt = Utils.getUnixTimestampUTC();
        logger.debug(this.name, '#setQueryCreatedAtAndModifiedAt() createdAt:', context.createdAt,
            'modifiedAt:', context.modifiedAt);

        context.query
            .set(this.ATTR_CREATED_AT, context.createdAt)
            .set(this.ATTR_MODIFIED_AT, context.modifiedAt);
    }

    /**
     * This method stringifies context.query and logs the value of it.
     * Overwrite this method if you have to stringify more than one query
     * or if you named the query differently.
     * @param  {object} context
     *         internal context object in #create().
     * @param  {object} options
     *         options object which got passed to GenericCreate.create().
     */
    static stringifyQuery(context, options) {
        context.query = context.query.toString();
        logger.debug(this.name, '#create() query:', context.query);
    }

    /**
     * In case your query is named differently or you have to do more advanced
     * stuff, Overwrite this method.
     * @async
     * @param  {object} context
     *         internal context object in #create().
     * @param  {object} options
     *         options object which got passed to GenericCreate.create().
     * @throws {Error}
     *         Throws all sql errors
     */
    static async executeQuery(context, options) {
        context.result = await sqlite.run(context.query);
        context.insertId = context.result.stmt.lastID;
        logger.debug(this.name, '#create() result:', context.result);
    }

    /**
     * This method builds the returnObject by iterating over all ATTRIBUTES
     * and trying to retrieve the information either from context, options or
     * DEFAULT_VALUES_ATTRIBUTES. We also add internal attributes.
     * The so called `recordObject` will be in
     * returnObject[plural][insertId]. returnObject is the object returned
     * from #create().
     * @param  {object} returnObject
     *         object which will later get returned from #create().
     * @param  {object} context
     *         internal context object in #create().
     * @param  {object} options
     *         options object which got passed to GenericCreate.create().
     */
    static buildReturnObject(returnObject, context, options) {
        let recordObject = {};
        for (let attr of this.ATTRIBUTES) {
            if (!_.isUndefined(context[attr])) {
                recordObject[attr] = context[attr];
            } else if (!_.isUndefined(options[attr])) {
                recordObject[attr] = options[attr];
            } else if (!_.isUndefined(this.DEFAULT_VALUES_ATTRIBUTES[attr])) {
                recordObject[attr] = this.DEFAULT_VALUES_ATTRIBUTES[attr];
            } else {
                recordObject[attr] = null;
            }
        }

        recordObject[this.ATTR_ID] = context.insertId;
        recordObject[this.ATTR_CREATED_AT] = context.createdAt;
        recordObject[this.ATTR_MODIFIED_AT] = context.modifiedAt;

        returnObject[this.PLURAL] = {
            [context.insertId]: recordObject
        };
    }
}

// set this field for the default table name used in #initQuery()
GenericCreate.TABLE = null;

GenericCreate.ATTR_ID;

GenericCreate.ATTR_CREATED_AT;

GenericCreate.ATTR_MODIFIED_AT;

GenericCreate.ATTRIBUTES = [];

GenericCreate.SKIP_ATTRIBUTES = [];

GenericCreate.DEFAULT_VALUES_ATTRIBUTES = [];

GenericCreate.PLURAL;

module.exports = GenericCreate;
