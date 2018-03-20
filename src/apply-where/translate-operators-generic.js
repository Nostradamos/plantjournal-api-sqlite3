'use strict';

const _ = require('lodash');

const logger = require('../logger');

const UtilsExpression = require('../utils/utils-expression');

/**
 * Generic translator class which holds the basic functionality to translate
 * criterias for an attribute. We want to translate all query/criteria
 * instructions for an attribute into squel expressions.
 * Don't create an instance of this class, simply call
 * #translateAndApplyOperators().
 * NOTE: This class does not handle any relational operators,
 * for this see TranslateOperatorsRelational and also no binary operators
 * (for this see apply-where).
 * NOTE: This is never used alone and therefore maybe gets merged with
 * TranslateOperatorsRelational.
 */
class TranslateOperatorsGeneric {
  /**
   * This method will do the whole translation process by calling the
   * different  sub methods in order and apply the created squel expressions
   * to squelExpr.
   * @param  {Object} selfSelf
   *         Self object of apply-where
   * @param  {String} attr
   *         Name of the attribute we want to translate attrOptions for.
   *         NOTE: This has to be an legal attribute!
   * @param  {Object|String|Number|Boolean|Null} attrOptions
   *         Object containing where instructions. Can be something like this:
   *         `{$eq: "foo", $neq: "bar"}`
   * @param  {squelExpr} squelExpr
   *         Parent squelExpr to apply our sub expressions to.
   *         Gets mutated.
   * @param  {String} type
   *         Has to be 'and' or 'or'.
   */
  static translateAndApplyOperators(
    selfSelf, attr, attrOptions, squelExpr, type) {
    logger.silly(this.name, '#translateAndApplyOperators() attr:', attr, 'attrOptions:', attrOptions, 'type:', type);

    // This object will get passed to every method of this class we will
    // call. If you need to store anything across the different methods,
    // store it in self.
    let self = {
      selfSelf,
      attr,
      attrOptions,
      squelExpr,
      type
    };


    this.getTable(self);
    this.modifySelf(self);

    logger.silly(this.name, '#translateAndApplyOperators() self.table:', self.table);

    if(_.isPlainObject(attrOptions)) {
      this.callOperatorFuncsAndApplyCriterias(self);
    } else {
      this.checkForShortHands(self);
    }

    this.beforeDone(self);
  }

  /**
   * Overwrite this method to set the correct table for this attribute.
   * The name of the table should be stored inside self.table.
   * @param  {Object} self
   *         Object containing information about this translation process
   */
  static getTable(self) {
    self.table = undefined;
  }

  /**
   * Overwrite this method if you have to alter other self properties and
   * not only self.table.
   * @param  {Object} self
   *         Object containing information about this translation process
   */
  static modifySelf(self) {}

  /**
   * Checks if any matching operator is defined inside attrOptions
   * and if so call the related operator function. The operator function
   * can alter the crit object to create a new squel expression
   * which will get applied to self.squelExpr.
   * Normally you shouldn't need to overwrite this function, but only
   * register new operators inside this.OPERATORS.
   * @param  {Object} self
   *         Object containing information about this translation process
   */
  static callOperatorFuncsAndApplyCriterias(self) {
    let handledOperators = 0;
    let lengthAttrOptions = _.keys(self.attrOptions);

    let crit = {};

    for(let operator in this.OPERATORS) {
      let operatorFunc = this.OPERATORS[operator];
      let operatorOptions = self.attrOptions[operator];

      // If we have no operatorOptions, no such operator got defined for this
      // operation.
      if(_.isUndefined(operatorOptions)) continue;

      logger.silly(this.name, '#callOperatorFuncsAndApplyCriterias() operator:', operator, 'is defined operatorOptions:', operatorOptions);

      [crit.crit, crit.args] = [null, []];
      operatorFunc.call(this, self, operatorOptions, crit);

      logger.silly(
        this.name, '#callOperatorFuncsAndApplyCriterias()', crit);

      this._applycrit(self, crit);
      handledOperators++;

      // If we checked for more operators then the object has attributes,
      // break the loop.
      if(handledOperators >= lengthAttrOptions) {
        break;
      }
    }

    if(handledOperators < lengthAttrOptions) {
      logger.warn('Looks like we have unhandled operators');
    }
  }

  /**
   * Checks for short hands. A short hand is any attrOptions which hasn't
   * the type of an plain object. By default we can handle strings, numbers
   * booleans and null (which are grouped together to the
   * #processStringNumberBooleanNullShortHand() shorthand) and arrays
   * (#processArrayShortHand()). If attrOptions is neither one of those,
   * this method calls #unhandledShortHand().
   * @param  {Object} self
   *         Object containing information about this translation process
   */
  static checkForShortHands(self) {
    let crit = {crit: null, args: []};

    if (_.isString(self.attrOptions) ||
            _.isNumber(self.attrOptions) ||
            _.isBoolean(self.attrOptions) ||
            _.isNull(self.attrOptions)) {
      logger.silly(this.name, '#checkForShortHands() looks like String or Number/Boolean/Null short hand');
      this.processStringNumberBooleanNullShortHand(self, crit);
    } else if (_.isArray(self.attrOptions)) {
      logger.silly(this.name, '#checkForShortHands() looks like Array short hand');
      this.processArrayShortHand(self, crit);
    } else {
      this.unhandledShortHand(self);
      return;
    }

    logger.silly(this.name, '#checkForShortHands()', crit);

    this._applycrit(self, crit);
  }

  /**
   * This method gets called if attrOptions is a Number (Integer or Float),
   * String, Boolean or null. Based on this you can create a new squel
   * expression inside crit or just leave crit.crit null to not do anything.
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
  static processStringNumberBooleanNullShortHand(self, crit) {}

  /**
   * This method gets called if attrOptions is an array.
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
  static processArrayShortHand(self, crit) {}

  /**
   * This method gets called if the type of attrOptions is neither
   * Number, String, Boolean, Null or Array.
   * @param  {Object} self
   *         Object containing information about this translation process
   */
  static unhandledShortHand(self) {
    logger.warn('Unhandled short hand:', typeof self.attrOptions);

  }


  /**
   * Method gets called at the end, overwrite in case you need to do
   * something at the end.
   * @param  {Object} self
   *         Object containing information about this translation process
   */
  static beforeDone(self) {}

  /**
   * Helper function to apply crit to self.squelExpr.
   * @param  {Object} self
   *         Object containing information about this translation process
   * @param  {Object} crit
   *         Object which contains expression and expressionArgs. Modify
   *         this two properties to create a new expression which gets
   *         added to self.squelExpr.
   * @param  {String} crit.crit
   *         Has to be a valid sqlite expression. You can use `?` as a
   *         placeholder for variables. For each placeholder there has to
   *         be an element in crit.args. Set to null to not do a thing.
   * @param  {Array} crit.args
   *         Arguments for placeholders inside crit.crit
   */
  static _applycrit(self, crit) {
    if(crit.crit !== null) {
      UtilsExpression.applyExpression(
        self.squelExpr, crit.crit, crit.args, self.type);
    } else {
      logger.warn('crit.crit is null');
    }
  }
}

/**
 * This attribute holds all operators as key and the related operator
 * function as value. Operators should normally start with an '$'.
 * @type {Object<String, Function>}
 */
TranslateOperatorsGeneric.OPERATORS = {};

module.exports = TranslateOperatorsGeneric;
