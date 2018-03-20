'use strict';

const CONSTANTS = require('../../constants');
const GenericUpdate = require('../generic/generic-update');

/**
 * This class updates environments. To call it manually use
 * JournalUpdate.update().
 * @private
 * @extends GenericUpdate
 */
class JournalUpdate extends GenericUpdate {
}


JournalUpdate.TABLE = CONSTANTS.TABLE_JOURNAL;

JournalUpdate.ATTR_ID = CONSTANTS.ATTR_ID_JOURNAL;

JournalUpdate.ATTR_MODIFIED_AT = CONSTANTS.ATTR_MODIFIED_AT_JOURNAL;

JournalUpdate.ATTRIBUTES_SEARCHABLE = CONSTANTS.RELATED_ATTRIBUTES_JOURNAL;

JournalUpdate.ATTRIBUTES_UPDATABLE = CONSTANTS.ATTRIBUTES_JOURNAL;

module.exports = JournalUpdate;
