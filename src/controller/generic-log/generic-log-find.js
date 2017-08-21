'use strict';

const _ = require('lodash');

const Utils = require('../../utils');

const GenericFind = require('../generic/generic-find');

/**
 * Extends GenericFind to better fit needs for log finds.
 * We use this for plantLogFind, environmentLogFind and mediumLogFind.
 * @private
 * @extends GenericFind
 */
class GenericLogFind extends GenericFind {

    /**
     * Because we know all attributes which need to be placed in returnObject,
     * we can do this for all GenericLogFind instances.
     * @param  {object} returnObject
     *         object which will get returned later from #find().
     * @param  {object} context
     *         Internal context object
     * @param  {object} criteria
     *         Criteria object passed to find()
     */
    static buildReturnObjectWhere(returnObject, context, criteria) {
        let parentScope = this;
        returnObject.plantLogs = {};

        for(let row of context.rowsWhere) {
            Utils.addNeededFromRowToLogReturnObject(
                row,
                returnObject,
                parentScope.ATTR_TIMESTAMP,
                parentScope.ATTR_ID,
                parentScope.ATTRIBUTES_SEARCHABLE,
                parentScope.PLURAL,
                criteria
            );
        });
    }
}

/*******************
 * GenericFind class attributes
 *******************/

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


/*******************
 * GenericLogFind Additional class attributes
 *******************/

 // Name of the id attribute of the log table
 // Eg: plantLogId
GenericLogFind.ATTR_ID;

// Timestamp attribute for this GenericLogFind instance.
// Eg: plantLogTimestamp
GenericLogFind.ATTR_TIMESTAMP;

// Plural of GenericLogDelete instance.
// Eg: plantlogs/mediumlogs.
GenericLogFind.PLURAL;

module.exports = GenericLogFind;
