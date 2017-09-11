'use strict';

const _ = require('lodash');

const CONSTANTS = require('../../constants');
const Utils = require('../../utils');

const GenericCreate = require('../generic/generic-create');

/**
 * This class creates a new Journal and gets internally called from
 * Journal.create(). If you want to know how Create works internally, see
 * src/controller/generic-create. If you want to know how to use the
 * Journal.create() API from outside, see src/models/Journal #create().
 * @private
 * @extends GenericCreate
 */
class JournalCreate extends GenericCreate {
    /**
     * We need to validate the properties for new journal.
     * @param  {object} context
     *         internal context object in #create().
     * @param  {object} options
     *         options object which got passed to GenericCreate.create().
     * @throws {Error}
     */
    static validateOptions(context, options) {
        // Figure out for which model this journal is for
        context.journalFor = null;
        for(let attr of [CONSTANTS.ATTR_ID_PLANT, CONSTANTS.ATTR_ID_MEDIUM, CONSTANTS.ATTR_ID_ENVIRONMENT]) {
            if(_.has(options, attr)) {
                Utils.hasToBeInt(options, attr);
                if(context.journalFor === null) {
                    context.journalFor = attr;
                } else {
                    throw Error('Journal can only be assigned to a plant OR medium OR environment');
                }
            }
        }

        if(context.journalFor === null) {
            throw Error('A journal has to be assigned to a plant, medium or environment. Therefore options.plantId,mediumId or environmentId has to be set');
        }

        Utils.hasToBeSet(options, CONSTANTS.ATTR_TIMESTAMP_JOURNAL);
        Utils.hasToBeInt(options, CONSTANTS.ATTR_TIMESTAMP_JOURNAL);

        Utils.hasToBeSet(options, CONSTANTS.ATTR_TYPE_JOURNAL);
        Utils.hasToBeString(options, CONSTANTS.ATTR_TYPE_JOURNAL);

        Utils.hasToBeSet(options, CONSTANTS.ATTR_VALUE_JOURNAL);

    }

    static sanitizeOptions(context, options) {
        if(_.isBoolean(options.journalValue)) {
            options.journalValue = _.toString(options.journalValue);
        }
    }

    static setQueryFields(context, options) {
        this.sanitizeOptions(context, options);

        super.setQueryFields(context, options);
        context.query
            .set(context.journalFor, options[context.journalFor])
            .set(CONSTANTS.ATTR_ID_JOURNAL, null)
            .set(CONSTANTS.ATTR_TIMESTAMP_JOURNAL, options.journalTimestamp)
            .set(CONSTANTS.ATTR_TYPE_JOURNAL, options.journalType)
            .set(CONSTANTS.ATTR_VALUE_JOURNAL, options.journalValue);
    }

    static buildReturnObject(returnObject, context, options) {
        returnObject[this.PLURAL] = {
            [context.insertId]: {
                [CONSTANTS.ATTR_ID_JOURNAL]: context.insertId,
                [CONSTANTS.ATTR_TIMESTAMP_JOURNAL]: options.journalTimestamp,
                [CONSTANTS.ATTR_TYPE_JOURNAL]: options.journalType,
                [CONSTANTS.ATTR_VALUE_JOURNAL]: options.journalValue,
                [CONSTANTS.ATTR_CREATED_AT_JOURNAL]: context.createdAt,
                [CONSTANTS.ATTR_MODIFIED_AT_JOURNAL]: context.modifiedAt,
                [context.journalFor]: options[context.journalFor]
            }
        };
    }

}

JournalCreate.TABLE = CONSTANTS.TABLE_JOURNAL;

JournalCreate.ATTR_ID = CONSTANTS.ATTR_ID_JOURNAL;

JournalCreate.ATTR_CREATED_AT = CONSTANTS.ATTR_CREATED_AT_JOURNAL;

JournalCreate.ATTR_MODIFIED_AT = CONSTANTS.ATTR_MODIFIED_AT_JOURNAL;

JournalCreate.ATTRIBUTES = CONSTANTS.ATTRIBUTES_JOURNAL;

JournalCreate.DEFAULT_VALUES_ATTRIBUTES = {
};

JournalCreate.PLURAL = CONSTANTS.PLURAL_JOURNAL;


module.exports = JournalCreate;
