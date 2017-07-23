'use strict';

const _ = require('lodash');
const squel = require('squel');
const sqlite = require('sqlite');

const logger = require('../logger');
const Utils = require('../utils');
const QueryUtils = require('../utils-query');

/**
 * Generic update class which is the skeleton for all *-update classes.
 * It defines some general update behaviour and lets space to modifiy
 * this behaviour for the different update classes.
 * @private
 */
class GenericUpdate {

    /**
   * This Method executes the whole update process.
   * Don't overwrite this method if possible, but overwrite the
   * different sub methods to get the behaviour you want.
   * Returns an array of updated ids
   * @param  {object}  update   - Object containing aliases as key to update with
   *                              new value. Eg: {'familyName': 'newFamName'}
   * @param  {object}  criteria - Criteria Object describing which entries should
   *                              get updated.
   * @return {Promise}          - Returns array of updated ids
   */
    static async update(update, criteria){
        Utils.throwErrorIfNotConnected();
        logger.debug(this.name, '#update() update:', JSON.stringify(update), 'criteria:', JSON.stringify(criteria) || undefined);

        // Validate update and criteria arguments
        if(_.isUndefined(update) && _.isUndefined(criteria)) throw new Error('No Update and Critera Object got passed');
        if(_.isUndefined(criteria)) throw new Error('No Criteria Object got passed');
        Utils.hasToBeAssocArray(update, 'Update Object');
        Utils.hasToBeAssocArray(criteria, 'Criteria Object');

        let context = {};

        // First we pick fields to update. If nothing is to update,
        // we will return right away.
        this.pickFieldsToUpdate(context, update, criteria);
        if(_.isEmpty(context.fieldsToUpdate)) {
            logger.debug(this.name, '#update() fieldsToUpdate is empty, returning');
            return [];
        }

        this.initQueryFind(context, update, criteria);
        this.setQueryFindJoin(context, update, criteria);
        this.setQueryFindIdField(context, update, criteria);
        this.setQueryFindWhere(context, update, criteria);
        this.setQueryFindLimitAndOffset(context, update, criteria);
        this.setQueryFindGroup(context, update, criteria);
        this.stringifyQueryFind(context, update, criteria);

        await this.executeQueryFind(context, update, criteria);
        this.extractIdsRowsFind(context, update, criteria);


        this.initQueryUpdate(context, update, criteria);
        this.setQueryUpdateFieldValues(context, update, criteria);
        this.setQueryUpdateModifiedAt(context, update, criteria);
        this.setQueryUpdateWhere(context, update, criteria);
        this.stringifyQueryUpdate(context, update, criteria);

        await this.executeQueryUpdate(context, update, criteria);

        // No need to build a returnObject, just return context.idsToUpdate.
        return context.idsToUpdate;
    }

    /**
   * Picks all fields to update. This means only keys in update,
   * which are also in this.ATTRIBUTES_UPDATABLE will be copied into
   * context.fieldsToUpdate. We do this at the beginning to return
   * if nothing is to do.
   * @param  {object} context   - Internal context object
   * @param  {object} update    - Updated object passed to update()
   * @param  {object} criteria  - Criteria object passed to update()
   */
    static pickFieldsToUpdate(context, update, criteria) {
    // only take fields which are updatable and drop everything else
        context.fieldsToUpdate = _.pick(update, this.ATTRIBUTES_UPDATABLE);

        logger.debug(this.name, '#update() fieldsToUpdate:', context.fieldsToUpdate);

    }

    /**
   * Init queryFind as a select from this.TABLE.
   * @param  {object} context   - Internal context object
   * @param  {object} update    - Updated object passed to update()
   * @param  {object} criteria  - Criteria object passed to update()
   */
    static initQueryFind(context, update, criteria) {
        context.queryFind = squel.select().from(this.TABLE);
    }

    /**
   * Sets id field to select for queryFind
   * @param  {object} context   - Internal context object
   * @param  {object} update    - Updated object passed to update()
   * @param  {object} criteria  - Criteria object passed to update()
   */
    static setQueryFindIdField(context, update, criteria) {
        context.queryFind.field(this.TABLE + '.' + this.ATTR_ID, this.ATTR_ID);
    }

    /**
   * In case you want to join other tables to make your where part working,
   * overwrite this method. By default this method does nothing.
   * @param  {object} context   - Internal context object
   * @param  {object} update    - Updated object passed to update()
   * @param  {object} criteria  - Criteria object passed to update()
   */
    static setQueryFindJoin(context, update, criteria) {
    }

    /**
   * Sets where() for queryFind
   * @param  {object} context   - Internal context object
   * @param  {object} update    - Updated object passed to update()
   * @param  {object} criteria  - Criteria object passed to update()
   */
    static setQueryFindWhere(context, update, criteria) {
        QueryUtils.applyFilter(context.queryFind, this.ATTRIBUTES_SEARCHABLE, criteria);
    }

    /**
   * Sets limit and offset for queryFind
   * @param  {object} context   - Internal context object
   * @param  {object} update    - Updated object passed to update()
   * @param  {object} criteria  - Criteria object passed to update()
   */
    static setQueryFindLimitAndOffset(context, update, criteria) {
        QueryUtils.setLimitAndOffset(context.queryFind, criteria);
    }

    static setQueryFindGroup(context, update, criteria) {
        context.queryFind.group(this.TABLE + '.' + this.ATTR_ID);
    }
    /**
   * Stringifies queryFind and logs the query
   * @param  {object} context   - Internal context object
   * @param  {object} update    - Updated object passed to update()
   * @param  {object} criteria  - Criteria object passed to update()
   */
    static stringifyQueryFind(context, update, criteria) {
        context.queryFind = context.queryFind.toString();

        logger.debug(this.name, '#update() queryFind:', context.queryFind);
    }

    /**
   * Executes queryFind and saves result to context.rowsFind.
   * Logs rowsFind
   * @param  {object} context   - Internal context object
   * @param  {object} update    - Updated object passed to update()
   * @param  {object} criteria  - Criteria object passed to update()
   * @return {Promise}
   */
    static async executeQueryFind(context, update, criteria) {
        context.rowsFind = await sqlite.all(context.queryFind);

        logger.debug(this.name, '#update() rowsFind:', context.rowsFind);
    }

    /**
   * Extracts ids based on this.ATTR_ID from context.rowsFind
   * and puts them into context.idsToUpdate.
   * Logs idsToUpdate
   * @param  {object} context   - Internal context object
   * @param  {object} update    - Updated object passed to update()
   * @param  {object} criteria  - Criteria object passed to update()
   */
    static extractIdsRowsFind(context, update, criteria) {
        context.idsToUpdate = [];
        _.each(context.rowsFind, function(row) {
            context.idsToUpdate.push(row[this.ATTR_ID]);
        }.bind(this));

        logger.debug(this.name, '#update() context.idsToUpdate:', context.idsToUpdate);
    }

    /**
   * Inits context.queryUpdate. No need to overwrite.
   * @param  {object} context   - Internal context object
   * @param  {object} update    - Updated object passed to update()
   * @param  {object} criteria  - Criteria object passed to update()
   */
    static initQueryUpdate(context, update, criteria) {
        context.queryUpdate = squel.update().table(this.TABLE);
    }

    /**
   * Sets fields for context.queryUpdate from update argument passed to
   * #update(). Ignores any key which is not in this.ATTRIBUTES_UPDATABLE.
   * @param  {object} context   - Internal context object
   * @param  {object} update    - Updated object passed to update()
   * @param  {object} criteria  - Criteria object passed to update()
   */
    static setQueryUpdateFieldValues(context, update, criteria) {
        context.queryUpdate.setFields(
            context.fieldsToUpdate
        );
    }

    /**
   * Sets modifedAt Field with current timestamp.
   * @param  {object} context   - Internal context object
   * @param  {object} update    - Updated object passed to update()
   * @param  {object} criteria  - Criteria object passed to update()
   */
    static setQueryUpdateModifiedAt(context, update, criteria) {
        context.modifiedAt = Utils.getUnixTimestampUTC();
        logger.debug(this.name, '#update() ATTR_MODIFIED_AT:', this.ATTR_MODIFIED_AT);
        context.queryUpdate.set(
            this.ATTR_MODIFIED_AT,
            context.modifiedAt
        );
    }

    /**
   * Sets where part for which ids to update.
   * Uses context.idsToUpdate.
   * @param  {object} context   - Internal context object
   * @param  {object} update    - Updated object passed to update()
   * @param  {object} criteria  - Criteria object passed to update()
   */
    static setQueryUpdateWhere(context, update, criteria) {
        context.queryUpdate
            .where(this.TABLE + '.' + this.ATTR_ID + ' IN ?', context.idsToUpdate);
    }

    /**
   * Stringifies queryUpdate and logs it.
   * @param  {object} context   - Internal context object
   * @param  {object} update    - Updated object passed to update()
   * @param  {object} criteria  - Criteria object passed to update()
   */
    static stringifyQueryUpdate(context, update, criteria) {
        context.queryUpdate = context.queryUpdate.toString();

        logger.debug(this.name, '#update() queryUpdate:', context.queryUpdate.toString());
    }

    /**
   * Executes queryUpdate and saves result into context.resultUpdate.
   * Logs resultUpdate.
   * @param  {object} context   - Internal context object
   * @param  {object} update    - Updated object passed to update()
   * @param  {object} criteria  - Criteria object passed to update()
   * @return {Promise}
   */
    static async executeQueryUpdate(context, update, criteria) {
        context.resultUpdate = await sqlite.get(context.queryUpdate);

        logger.debug(this.name, '#update() resultUpdate:', context.resultUpdate);
    }
}

GenericUpdate.TABLE; // Table name

GenericUpdate.ATTR_ID; // name of id field

GenericUpdate.ATTR_MODIFIED_AT; // name of modifiedAt Field

GenericUpdate.ATTRIBUTES_SEARCHABLE; // array of aliases which we can search through

GenericUpdate.ATTRIBUTES_UPDATABLE; // array of aliases which we can update, everything else will be ignored

module.exports = GenericUpdate;
