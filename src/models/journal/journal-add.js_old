'use strict';

const _ = require('lodash');
const squel = require('squel');

const CONSTANTS = require('../../constants');
const Utils = require('../../utils/utils');
const UtilsJSON = require('../../utils/utils-json');
const logger = require('../../logger');

const GenericAdd = require('../generic/generic-add');

/**
 * This class creates a new Journal and gets internally called from
 * Journal.add(). If you want to know how Create works internally, see
 * src/controller/generic-add. If you want to know how to use the
 * Journal.add() API from outside, see src/models/Journal #create().
 * @private
 * @extends GenericAdd
 */
class JournalAdd extends GenericAdd {
  /**
   * We need to validate the properties for new journal.
   * @param  {object} self
   *         Namespace/object only for the context of this class and this
   *         creation process. Not shared across differenct classes in
   *         callStack.
   * @param  {object} context
   *         Namespace/object of this creation process. It's shared across
   *         all classes in callStack.
   * @throws {Error}
   */
  static validate(self, context) {
    // Figure out for which model this journal is for
    let options = context.options;
    self.journalFor = null;
    let models = [
      CONSTANTS.ATTR_ID_PLANT,
      CONSTANTS.ATTR_ID_MEDIUM,
      CONSTANTS.ATTR_ID_ENVIRONMENT
    ];

    for(let attr of models) {
      if(!_.has(options, attr)) {
        continue;
      }

      Utils.hasToBeInt(options, attr);

      if(self.journalFor !== null) {
        throw Error('Journal can only be assigned to a plant OR medium OR environment');
      }

      self.journalFor = attr;
    }

    if(self.journalFor === null) {
      throw Error('A journal has to be assigned to a plant, medium or environment. Therefore options.plantId,mediumId or environmentId has to be set');
    }

    Utils.hasToBeSet(options, CONSTANTS.ATTR_DATETIME_JOURNAL);
    Utils.hasToBeInt(options, CONSTANTS.ATTR_DATETIME_JOURNAL);

    Utils.hasToBeSet(options, CONSTANTS.ATTR_TYPE_JOURNAL);
    Utils.hasToBeString(options, CONSTANTS.ATTR_TYPE_JOURNAL);

    Utils.hasToBeSet(options, CONSTANTS.ATTR_VALUE_JOURNAL);

  }

  /**
   * Set query fields and do some special stuff for journalValue to always
   * parse json inside sqlite and sometimes quote it.
   * @param  {object} self
   *         Namespace/object only for the context of this class and this
   *         creation process. Not shared across differenct classes in
   *         callStack.
   * @param  {object} context
   *         Namespace/object of this creation process. It's shared across
   *         all classes in callStack.
   */
  static setQueryFields(self, context) {
    let options = context.options;
    self.query
      .set(self.journalFor, options[self.journalFor])
      .set(CONSTANTS.ATTR_ID_JOURNAL, null)
      .set(CONSTANTS.ATTR_DATETIME_JOURNAL, options.journalDatetime)
      .set(CONSTANTS.ATTR_TYPE_JOURNAL, options.journalType);


    let sanitizedJournalValue = UtilsJSON.sanitize(options.journalValue);
    logger.silly(
      `${this.name} #setQueryFields() sanitizedJournalValue:`,
      sanitizedJournalValue);

    self.query.set(
      CONSTANTS.ATTR_VALUE_JOURNAL,
      squel.rstr('json(?)', sanitizedJournalValue),
      {dontQuote: true});
  }

  /**
   * Build returnObject
   * @param  {object} self
   *         Namespace/object only for the context of this class and this
   *         creation process. Not shared across differenct classes in
   *         callStack.
   * @param  {object} context
   *         Namespace/object of this creation process. It's shared across
   *         all classes in callStack.
   */
  static buildReturnObject(self, context) {
    let options = context.options;
    context.returnObject[this.PLURAL] = {
      [self.insertId]: {
        [CONSTANTS.ATTR_ID_JOURNAL]: self.insertId,
        [CONSTANTS.ATTR_DATETIME_JOURNAL]: options.journalDatetime,
        [CONSTANTS.ATTR_TYPE_JOURNAL]: options.journalType,
        [CONSTANTS.ATTR_VALUE_JOURNAL]: options.journalValue,
        [CONSTANTS.ATTR_ADDED_AT_JOURNAL]: context.createdAt,
        [CONSTANTS.ATTR_MODIFIED_AT_JOURNAL]: context.createdAt,
        [self.journalFor]: options[self.journalFor]
      }
    };
  }

}

JournalAdd.TABLE = CONSTANTS.TABLE_JOURNAL;

JournalAdd.ATTR_ID = CONSTANTS.ATTR_ID_JOURNAL;

JournalAdd.ATTR_ADDED_AT = CONSTANTS.ATTR_ADDED_AT_JOURNAL;

JournalAdd.ATTR_MODIFIED_AT = CONSTANTS.ATTR_MODIFIED_AT_JOURNAL;

JournalAdd.ATTRIBUTES = CONSTANTS.ATTRIBUTES_JOURNAL;

JournalAdd.DEFAULT_VALUES_ATTRIBUTES = {
};

JournalAdd.PLURAL = CONSTANTS.PLURAL_JOURNAL;


module.exports = JournalAdd;
