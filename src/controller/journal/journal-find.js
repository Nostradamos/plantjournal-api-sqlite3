'use strict';

const CONSTANTS = require('../../constants');
const UtilsReturnObject = require('../../utils/utils-return-object');

const GenericFind = require('../generic/generic-find');

/**
 * This class find journals and related records and returns all this
 * information. To manually execute, call JournalFind.find(). To understand
 * how finds work generally internally, See
 * src/controller/generic/generic-find (we extend that class). If you want to
 * know how to use the Journal.find() API, See
 * src/models/journal #find().
 * <strong>Note:</strong> Do not use directly.
 * @private
 * @extends GenericFind
 */
class JournalFind extends GenericFind {
  /**
   * We need to overwrite this method to, yeah, build the returnObject. We
   * basically iterate over each row we get from database and add all
   * journal related attributes to returnObject.journals.
   * @override
   * @param  {object} returnObject
   *         object which will get returned later from #find().
   * @param  {object} context
   *         Internal context object
   *         Criteria object passed to find()
   */
  static buildReturnObjectWhere(returnObject, context, criteria) {
    // build families object
    returnObject.journals =  {};

    for(let row of context.rowsWhere) {
      UtilsReturnObject.addJournal(row, returnObject);
    }
  }
}

JournalFind.TABLE = CONSTANTS.TABLE_JOURNAL;

JournalFind.ATTR_ID = CONSTANTS.ATTR_ID_JOURNAL;

JournalFind.ATTRIBUTES_SEARCHABLE = CONSTANTS.RELATED_ATTRIBUTES_JOURNAL;

JournalFind.OVERWRITE_TABLE_LOOKUP = {
  [CONSTANTS.ATTR_ID_ENVIRONMENT]: CONSTANTS.TABLE_JOURNAL,
  [CONSTANTS.ATTR_ID_MEDIUM]: CONSTANTS.TABLE_JOURNAL,
  [CONSTANTS.ATTR_ID_PLANT]: CONSTANTS.TABLE_JOURNAL
};

module.exports = JournalFind;
