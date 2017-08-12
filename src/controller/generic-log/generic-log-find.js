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
    static buildReturnObjectWhere(returnObject, context, criteria) {
    // build families object
        let parentScope = this;
        returnObject.plantLogs = {};
        _.each(context.rowsWhere, function(row) {
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

GenericLogFind.ATTR_ID;

GenericLogFind.ATTR_TIMESTAMP;

GenericLogFind.PLURAL;

module.exports = GenericLogFind;
