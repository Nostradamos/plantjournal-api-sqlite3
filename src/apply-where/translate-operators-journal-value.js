'use strict';

const _ = require('lodash');
const squel = require('squel');

const logger = require('../logger');
const CONSTANTS = require('../constants');
const Utils = require('../utils/utils');
const UtilsExpression = require('../utils/utils-expression');
const UtilsJSON = require('../utils/utils-json');

const TranslateOperatorsRelational = require(
  './translate-operators-relational');

/**
 * Translator class for the journalValue attribute. Because journalValue is
 * an JSON field, we want to handle json paths. So we basically translate
 * journalValue and journalValue$PATH attributes.
 * Example with paths:
 * `journalValue[0]` or `journalValue.foo.bar[42]`...
 * Full example:
 * {"journalValue.foo.bar[13]": {$eq: 'xyz'}}
 */
class TranslateOperatorsJournalValue extends TranslateOperatorsRelational {
  /**
     * We know the table, it will always be journals.
     * @param  {Object} self
       *         Object containing information about this translation process
     */
  static getTable(self) {
    self.table = CONSTANTS.TABLE_JOURNAL;
  }

  /**
     * We need to check if we want to query only the journalValue attribute
     * or a json path from it.
     * @param  {Object} self
     *         Object containing information about this translation process
     */
  static modifySelf(self) {

    self.func = null;
    self.funcArgs = null;

    let lengthAttrValue = CONSTANTS.ATTR_VALUE_JOURNAL.length;

    self.isPath = false;
    if(self.attr.length > lengthAttrValue) {
      let charAfterAttr = self.attr[lengthAttrValue];

      // Make sure the first char after journalValue is a `.` (dot) or
      // `[` (bracket). If not, throw an errror.
      if (charAfterAttr !== '.' && charAfterAttr !== '[') {
        throw new Error(
          `Invalid JSON Path for attr: ${self.attr}.JSON PATHS have to start with "." or "[" but it starts with "${charAfterAttr}"`);
      }

      // We need to access the attribute path value with a function, so
      // we want sqlite expressions like this:
      // `json_extract($TABLE.$ATTR, $PATH)`
      self.func = 'JSON_EXTRACT';

      // JSON paths for sqlite have to start with an `$`
      self.funcArgs = ['$' + self.attr.substr(lengthAttrValue)];
      self.attr = CONSTANTS.ATTR_VALUE_JOURNAL;
      self.isPath = true;
    }
  }

  /**
     * Operator function for equals ($eq)
     * NOTE: Can't use the TranslateOperatorsRelational.operatorEquals() method
     * because we need to relate to an json_exctrat() sqlite function and not
     * only the attribute
     * @param  {Object} self
     *         Object containing information about this translation process
     * @param  {String|Number|Boolean|Null} operatorOptions
     *         We want to find records, where attribute value equals this.
     * @param  {Object} crit
     *         Object which contains expression and expressionArgs. Modify
     *         this two properties to create a new expression which gets
     *         added to self.squelExpr.
     */
  static operatorEquals(self, operatorOptions, crit) {
    [crit.crit, crit.args] = UtilsExpression.createEqualsExpression(
      self.table,
      self.attr,
      UtilsJSON.sanitize(operatorOptions, self.isPath),
      self.func,
      self.funcArgs
    );
  }

  /**
     * Operator function for equals NOT ($neq)
     * NOTE: Can't use the TranslateOperatorsRelational.operatorNotEquals()
     * method because we need to relate to an json_exctrat() sqlite function and
     * not only the attribute.
     * @param  {Object} self
     *         Object containing information about this translation process
     * @param  {String|Number|Boolean|Null} operatorOptions
     *         We want to find records, where attribute value equals NOT this.
     * @param  {Object} crit
     *         Object which contains expression and expressionArgs. Modify
     *         this two properties to create a new expression which gets
     *         added to self.squelExpr.
     */
  static operatorNotEquals(self, operatorOptions, crit) {
    [crit.crit, crit.args] = UtilsExpression.createNotEqualsExpression(
      self.table, self.attr, UtilsJSON.sanitize(operatorOptions, self.isPath), self.func, self.funcArgs);
  }

  /**
     * Operator function for like ($like). Like is an relational operator
     * which matches a bit similiar to regexpressions, but a lot simpler.
     * Basically you have to special chars `_` and `%`. `_` matches exactly
     * one character, no whether which one. `%` matches zero or more characters.
     * For example if you want to check if an attribute contains the sub String
     * 'sensor' at any position, you could do following:
     * `{attribute: {$like: '%sensor%'}}`
     * NOTE: Can't use the TranslateOperatorsRelational.operatorLike() method
     * because we need to relate to an json_exctrat() sqlite function and not
     * only the attribute
     * @param  {Object} self
     *         Object containing information about this translation process
     * @param  {String} operatorOptions
     *         We want to find records, where attribute value is like this.
     * @param  {Object} crit
     *         Object which contains expression and expressionArgs. Modify
     *         this two properties to create a new expression which gets
     *         added to self.squelExpr.
     */
  static operatorLike(self, operatorOptions, crit) {
    [crit.crit, crit.args] = UtilsExpression.createLikeExpression(
      self.table,
      self.attr,
      UtilsJSON.sanitize(operatorOptions, self.isPath),
      self.func,
      self.funcArgs);
  }

  /**
     * Operator function for NOT like ($nlike)
     * NOTE: Can't use the TranslateOperatorsRelational.operatorNotLike() method
     * because we need to relate to an json_exctrat() sqlite function and not
     * only the attribute
     * @param  {Object} self
     *         Object containing information about this translation process
     * @param  {String} operatorOptions
     *         We want to find records, where attribute value is NOT like this.
     * @param  {Object} crit
     *         Object which contains expression and expressionArgs. Modify
     *         this two properties to create a new expression which gets
     *         added to self.squelExpr.
     */
  static operatorNotLike(self, operatorOptions, crit) {
    [crit.crit, crit.args] = UtilsExpression.createNotLikeExpression(
      self.table,
      self.attr,
      UtilsJSON.sanitize(operatorOptions, self.isPath),
      self.func,
      self.funcArgs);
  }

  /**
     * Operator function for greater than ($gt)
     * NOTE: Can't use the TranslateOperatorsRelational.operatorGreatherThan()
     * method because we need to relate to an json_exctrat() sqlite function and
     * not only the attribute
     * @param  {Object} self
     *         Object containing information about this translation process
     * @param  {Number} operatorOptions
     *         We want to find records, where attribute value greater than this.
     * @param  {Object} crit
     *         Object which contains expression and expressionArgs. Modify
     *         this two properties to create a new expression which gets
     *         added to self.squelExpr.
     */
  static operatorGreatherThan(self, operatorOptions, crit) {
    [crit.crit, crit.args] = UtilsExpression.createGreaterThanExpression(
      self.table,
      self.attr,
      UtilsJSON.sanitize(operatorOptions, self.isPath),
      self.func,
      self.funcArgs);
  }

  /**
     * Operator function for greater than equal ($gte)
     * NOTE: Can't use the
     * TranslateOperatorsRelational.operatorGreatherThanEqual() method because
     * we need to relate to an json_exctrat() sqlite function and not only the
     * attribute
     * @param  {Object} self
     *         Object containing information about this translation process
     * @param  {Number} operatorOptions
     *         We want to find records, where attribute value is greater or
     *         equal to this.
     * @param  {Object} crit
     *         Object which contains expression and expressionArgs. Modify
     *         this two properties to create a new expression which gets
     *         added to self.squelExpr.
     */
  static operatorGreatherThanEqual(self, operatorOptions, crit) {
    [crit.crit, crit.args] = UtilsExpression.createGreaterThanEqualExpression(
      self.table,
      self.attr,
      UtilsJSON.sanitize(operatorOptions, self.isPath),
      self.func,
      self.funcArgs);
  }

  /**
     * Operator function for lower than ($lt)
     * NOTE: Can't use the
     * TranslateOperatorsRelational.operatorLowerThan() method because we need
     * to relate to an json_exctrat() sqlite function and not only the
     * attribute
     * @param  {Object} self
     *         Object containing information about this translation process
     * @param  {Number} operatorOptions
     *         We want to find records, where attribute value is lower than
     *         this.
     * @param  {Object} crit
     *         Object which contains expression and expressionArgs. Modify
     *         this two properties to create a new expression which gets
     *         added to self.squelExpr.
     */
  static operatorLowerThan(self, operatorOptions, crit) {
    [crit.crit, crit.args] = UtilsExpression.createLowerThanExpression(
      self.table,
      self.attr,
      UtilsJSON.sanitize(operatorOptions, self.isPath),
      self.func,
      self.funcArgs);
  }

  /**
     * Operator function for lower than equal ($lte)
     * NOTE: Can't use the
     * TranslateOperatorsRelational.operatorLowerThanEqual() method because we
     * need to relate to an json_exctrat() sqlite function and not only the
     * attribute
     * @param  {Object} self
     *         Object containing information about this translation process
     * @param  {Number} operatorOptions
     *         We want to find records, where attribute value is lower or
     *         equal to this.
     * @param  {Object} crit
     *         Object which contains expression and expressionArgs. Modify
     *         this two properties to create a new expression which gets
     *         added to self.squelExpr.
     */
  static operatorLowerThanEqual(self, operatorOptions, crit) {
    [crit.crit, crit.args] = UtilsExpression.createLowerThanEqualExpression(
      self.table,
      self.attr,
      UtilsJSON.sanitize(operatorOptions, self.isPath),
      self.func,
      self.funcArgs);
  }

  /**
     * Operator function for IN operation. Checks if attribute value is in
     * an array of elements.
     * NOTE: Can't use the
     * TranslateOperatorsRelational.operatorIn() method because we need to
     * relate to an json_exctrat() sqlite function and not only the attribute
     * @param  {Object} self
     *         Object containing information about this translation process
     * @param  {Number[]|String[]} operatorOptions
     *         We want to find records, where attribute value is equal to
     *         one element in the array operatorOptions.
     * @param  {Object} crit
     *         Object which contains expression and expressionArgs. Modify
     *         this two properties to create a new expression which gets
     *         added to self.squelExpr.
     */
  static operatorIn(self, operatorOptions, crit) {
    if(!_.isArray(operatorOptions)) {
      TranslateOperatorsJournalValue.operatorEquals(
        self, operatorOptions, crit);
      return;
    }

    [crit.crit, crit.args] = UtilsExpression.createInExpression(
      self.table,
      self.attr,
      UtilsJSON.sanitizeArray(operatorOptions, self.isPath),
      self.func,
      self.funcArgs);
  }

  /**
     * Operator function for NOT IN operation. Checks if attribute value is NOT
     * in an array of elements.
     * NOTE: Can't use the
     * TranslateOperatorsRelational.operatorNotIn() method because we need to
     * relate to an json_exctrat() sqlite function and not only the attribute.
     * @param  {Object} self
     *         Object containing information about this translation process
     * @param  {Number[]|String[]} operatorOptions
     *         We want to find records, where attribute value is NOT equal to
     *         one element in the array operatorOptions.
     * @param  {Object} crit
     *         Object which contains expression and expressionArgs. Modify
     *         this two properties to create a new expression which gets
     *         added to self.squelExpr.
     */
  static operatorNotIn(self, operatorOptions, crit) {
    if(!_.isArray(operatorOptions)) {
      TranslateOperatorsJournalValue.operatorNotEquals(
        self, operatorOptions, crit);
      return;
    }

    [crit.crit, crit.args] = UtilsExpression.createNotInExpression(
      self.table,
      self.attr,
      UtilsJSON.sanitizeArray(operatorOptions, self.isPath),
      self.func,
      self.funcArgs);
  }

  /**
   * Builds an operatorHas or operatorNotHas expression.
   * NOTE: General Operator for $has and $nhas, as they both work very similiar,
   * we built one method to cover both of them. DON'T USE THIS METHOD FROM
   * OUTSIDE, USE #operatorHas() or #operatorNotHas().
   * @param  {Object} self
   *         Object containing information about this translation process
   * @param  {String} operatorOptions
   *         operatorOptions should be the name of the key for which we want
   *         to look for
   * @param  {Object} crit
   *         Object which contains expression and expressionArgs. Modify
   *         this two properties to create a new expression which gets
   *         added to self.squelExpr.
   * @param  {Boolean} [not=false]
   *         Flag to decide if we do the NOT operation or not
   */
  static operatorHasOrNotHas(self, operatorOptions, crit, not=false) {
    // We need to build a path based on the self.funcArgs (or $) path and the
    // operator argument.
    let path = (self.isPath ? self.funcArgs : '$');
    if(operatorOptions) {
      // We stringify operatorOptions to don't allow something like
      // '$.foo.key1.key2', would get translated into '$.foo."key1.key2"'.
      // This also allows us to have dots in keys.
      path += '.' + JSON.stringify(operatorOptions);
    }

    let func = not ?
      UtilsExpression.createIsNullExpression :
      UtilsExpression.createIsNotNullExpression;

    [crit.crit, crit.args] = func(self.table, self.attr,'json_type', [path]);
  }

  /**
   * This operator allows you to check if an JSON Array or Object has a specific
   * key at a certain path level.
   * @param  {Object} self
   *         Object containing information about this translation process
   * @param  {String} operatorOptions
   *         operatorOptions should be the name of the key for which we want
   *         to look for
   * @param  {Object} crit
   *         Object which contains expression and expressionArgs. Modify
   *         this two properties to create a new expression which gets
   *         added to self.squelExpr.
   */
  static operatorHas(self, operatorOptions, crit) {
    TranslateOperatorsJournalValue.operatorHasOrNotHas(
      self, operatorOptions, crit);
  }

  /**
   * This operator allows you to check if an JSON Array or Object has NOT a
   * specific key at a certain path level.
   * @param  {Object} self
   *         Object containing information about this translation process
   * @param  {String} operatorOptions
   *         operatorOptions should be the name of the key for which we want
   *         to look for
   * @param  {Object} crit
   *         Object which contains expression and expressionArgs. Modify
   *         this two properties to create a new expression which gets
   *         added to self.squelExpr.
   */
  static operatorNotHas(self, operatorOptions, crit) {
    TranslateOperatorsJournalValue.operatorHasOrNotHas(
      self, operatorOptions, crit, true);
  }

  /**
   * Builds an operatorContains or operatorNotContains expression.
   * NOTE: General Operator for $contains and $ncontains, as they both work
   * very similiar, we built one method to cover both of them.
   * Prefer to use #operatorContains() or #operatorNotContains().
   * @param  {Object} self
   *         Object containing information about this translation process
   * @param  {Number[]|String[]|Number|String|Null|Bool} operatorOptions
   *         We want to find records, where the JSON Array or Object has a value
   *         which is equal to operatorOptions or has values which all equal
   *         any of the elements of operatorOptions.
   * @param  {Object} crit
   *         Object which contains expression and expressionArgs. Modify
   *         this two properties to create a new expression which gets
   *         added to self.squelExpr.
   * @param  {Boolean} [not=false]
   *         Flag to decide if we do the NOT operation or not
   */
  static operatorContainsOrNotContains(self, operatorOptions, crit, not=false) {
    let path = (self.isPath ? self.funcArgs : '$');
    let attr = Utils.explicitColumnRstr(
      CONSTANTS.TABLE_JOURNAL, CONSTANTS.ATTR_VALUE_JOURNAL);

    let subQuery = squel.select()
      .field('value')
      .from(squel.rstr('json_each(?, ?)', attr, path));
    if(_.isArray(operatorOptions)) {
      subQuery
        .where('value IN ?', operatorOptions)
        .having('COUNT(*) = ?', operatorOptions.length);
    } else {
      subQuery.where('value = ?', operatorOptions);

    }

    logger.debug(
      `${this.name} #operatorContainsOrNotContains subQuery:`,
      subQuery.toString());

    let func = not ?
      UtilsExpression.createNotExistsExpression :
      UtilsExpression.createExistsExpression;
    [crit.crit, crit.args] = func(subQuery);
  }

  /**
   * This operator allows you to check if an JSON Array or Object has NOT a
   * specific key at a certain path level.
   * @param  {Object} self
   *         Object containing information about this translation process
   * @param  {Number[]|String[]|Number|String|Null|Bool} operatorOptions
   *         We want to find records, where the JSON Array or Object has a value
   *         which is equal to operatorOptions or has values which all equal
   *         any of the elements of operatorOptions.
   * @param  {Object} crit
   *         Object which contains expression and expressionArgs. Modify
   *         this two properties to create a new expression which gets
   *         added to self.squelExpr.
   */
  static operatorContains(self, operatorOptions, crit) {
    TranslateOperatorsJournalValue.operatorContainsOrNotContains(
      self, operatorOptions, crit);
  }

  /**
   * This operator allows you to check if an JSON Array or Object has NOT a
   * specific key at a certain path level.
   * @param  {Object} self
   *         Object containing information about this translation process
   * @param  {Number[]|String[]|Number|String|Null|Bool} operatorOptions
   *         We want to find records, where the JSON Array or Object has a value
   *         which is NOT equal to operatorOptions or has values which all
   *         DON'T equal any of the elements of operatorOptions.
   * @param  {Object} crit
   *         Object which contains expression and expressionArgs. Modify
   *         this two properties to create a new expression which gets
   *         added to self.squelExpr.
   */
  static operatorNotContains(self, operatorOptions, crit) {
    TranslateOperatorsJournalValue.operatorContainsOrNotContains(
      self, operatorOptions, crit, true);
  }

  /**
   * We need to customize the checkForShortHands behaviour on journalValue
   * because we process JSON data and JSON allows us to define arrays. So
   * whenever we see an array, we just want to do an equals on it and not
   * a in operation.
   * @param  {Object} self
   *         Object containing information about this translation process
   */
  static checkForShortHands(self) {
    let crit = {crit: null, args: []};
    if (_.isString(self.attrOptions) ||
        _.isNumber(self.attrOptions) ||
        _.isBoolean(self.attrOptions) ||
        _.isNull(self.attrOptions) ||
        _.isArray(self.attrOptions) ||
        _.isPlainObject(self.attrOptions)) {
      logger.silly(
        this.name, '#checkForShortHands() looks like String/Number/Boolean/Null/Array/PlainObject short hand');
      this.processStringNumberBooleanNullArrayPlainObjectShortHand(self, crit);
    } else {
      this.unhandledShortHand(self);
      return;
    }

    logger.silly(this.name, '#checkForShortHands()', crit);

    this._applycrit(self, crit);
  }

  /**
     * This method gets called if attrOptions is a Number (Integer or Float),
     * String, Boolean, null, Array of Plain Object. We will just execute
     * a normal equals operation. Benefit of this shorthand is that You
     * don't need to specify an {$eq: x} value and simply can pass the object.
     * Based on this you can create a new squel expression inside crit or just
     * leave crit.crit null to not do anything.
     * @param  {Object} self
     *         Object containing information about this translation process
     * @param  {Object} crit
     *         Object which contains expression and expressionArgs. Modify
     *         this two properties to create a new expression which gets
     *         added to self.squelExpr.
     * @param  {String} crit.crit
     *         By default null, you can set it to an sqlite expression.
     *         Eg: 'TABLE.ATTR >= ?'
     * @param  {Array} crit.args
     *         Apply any arguments for crit to this array.
     */
  static processStringNumberBooleanNullArrayPlainObjectShortHand(self, crit) {
    this.operatorEquals(self, self.attrOptions, crit);
  }
}

/**
 * All relational operators for journalValue
 * @type {Object<String, Function>}
 */
TranslateOperatorsJournalValue.OPERATORS = {
  '$eq': TranslateOperatorsJournalValue.operatorEquals,
  '$neq': TranslateOperatorsJournalValue.operatorNotEquals,
  '$like': TranslateOperatorsJournalValue.operatorLike,
  '$nlike': TranslateOperatorsJournalValue.operatorNotLike,
  '$gt': TranslateOperatorsJournalValue.operatorGreatherThan,
  '$gte': TranslateOperatorsJournalValue.operatorGreatherThanEqual,
  '$lt': TranslateOperatorsJournalValue.operatorLowerThan,
  '$lte': TranslateOperatorsJournalValue.operatorLowerThanEqual,
  '$in': TranslateOperatorsJournalValue.operatorIn,
  '$nin': TranslateOperatorsJournalValue.operatorNotIn,
  '$has': TranslateOperatorsJournalValue.operatorHas,
  '$nhas': TranslateOperatorsJournalValue.operatorNotHas,
  '$contains': TranslateOperatorsJournalValue.operatorContains,
  /*'$ncontains': TranslateOperatorsJournalValue.operatorNotContains*/
};

module.exports = TranslateOperatorsJournalValue;
