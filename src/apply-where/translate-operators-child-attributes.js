'use strict';

const _ = require('lodash');
const squel = require('squel');

const logger = require('../logger');
const Utils = require('../utils/utils');
const UtilsChildAttributes = require('../utils/utils-child-attributes');
const UtilsExpression = require('../utils/utils-expression');

const TranslateOperatorsRelational = require(
  './translate-operators-relational');

/**
 * This class translates criterias for generationParents and all other child
 * attributes like familyGenerations, generationGenotypes...
 * For example if you have a criteria object like this:
 * ```
 * {
 *  generationParents: {
 *      $eq: [1,2]
 *  },
 *  generationName: 'Blubb'
 * }
 * ```
 * Then we would process the "$eq: [1,2]" stuff inside this class.
 * NOTE: This class only contains static methods, so you can't create a new
 * instance of this class. To call this class, just call
 * TranslateOperatorsRelational.translateAndApplyOperators().
 */
class TranslateOperatorsChildAttributes extends TranslateOperatorsRelational {
  /**
     * We need to the (destination) table and attribute, and the (source) table
     * and attributes. They are different because we wont build our query
     * against the family table for the `familyGenerations` attribute but for
     * the generations table.
     * Besides that we need to redirect self.squelExpr to a new squel expression
     * because we want to build a subquery in the end. We also need another
     * squel expression to handle the having part of the new sub query.
     * @param  {Object} self
     *         Object containing information about this translation process
     */
  static modifySelf(self) {
    [self.table, self.attr, self.srcTable, self.srcAttr] =
            UtilsChildAttributes._getTableSrcTableSrcAttrOfChildAttribute(
              self.attr);
    self.squelExprOld = self.squelExpr;
    self.squelExpr = squel.expr();
    self.squelExprHaving = squel.expr();
  }

  /**
     * Operator function handling equals. The child attribute value will be
     * represented as an array, so the child attribute is equal to another
     * array if the contain the same elements and have the same count of
     * elements.
     * NOTE: We can't simply use the method provided by
     * TranslateOperatorsRelational because of the way we store
     * the generationParents. Each parent is in a own row which we join to.
     * So we get a row for every parent, for this row we need to make sure
     * that the id is in our equals array (operatorOptions), plus we need to
     * make sure that we selected exactly operatorOptions.length parents by
     * using a HAVIN expression.
     * @param  {Object} self
     *         Object containing information about this translation process
     * @param  {Integer|Integer[]} operatorOptions
     *         Array of integers which represent the plantIds (parentIds)
     *         we want to check against
     * @param  {Object} crit
     *         Expression object
     */
  static operatorEquals(self, operatorOptions, crit) {
    // With the in expression we make sure we only select values which are
    // in operator options
    this.operatorIn(self, operatorOptions, crit);

    // With the having expression we make sure that the count of the
    // previously selected values equals our operatorOptions.length.
    let [critHaving, critHavingArgs] = UtilsExpression.
      createEqualsExpression(
        self.table, self.attr, operatorOptions.length || 1, 'COUNT');

    logger.silly(`${this.name} #operatorEquals()`, critHaving, critHavingArgs);

    UtilsExpression.applyExpression(
      self.squelExprHaving, critHaving, critHavingArgs, self.type);
  }

  /**
     * Operator function for equals NOT ($neq). This operator lets you find
     * records where the child attribute value array is different to the
     * operator options value array.
     * They are not equal if they have a different count of elements or if they
     * consist of other values.
     * NOTE: We can't use the TranslateOperatorsRelational.operatorNotEquals()
     * method because we don't do an unequal operatoion on a column but on a
     * whole query of another table. So we more do a not in operation combined
     * with another query selecting all child attribute ids which have a
     * different count of values.
     * @param  {Object} self
     *         Object containing information about this translation process
     * @param  {Integer|Integer[]} operatorOptions
     *         We want to find records, where attribute value is not in
     *         this array.
     * @param  {Object} crit
     *         Object which contains expression and expressionArgs. Modify
     *         this two properties to create a new expression which gets
     *         added to self.squelExpr.
     */
  static operatorNotEquals(self, operatorOptions, crit) {
    // To for example get all generations which don't have a specific set of
    // parents, we need to find generations which have a different amount of
    // parents. We can't to this in one query, so we need to build a
    // subquery with an own expression.
    let [exprCountNotEqual, exprCountNotEqualArgs] = UtilsExpression
      .createNotEqualsExpression(
        self.table, self.attr, operatorOptions.length || 1, 'COUNT');

    let queryCountUnequal = squel.select()
      .from(self.table)
      .field(
        Utils.explicitColumnRstr(
          self.table, self.srcAttr))
      .group(
        Utils.explicitColumnRstr(
          self.table, self.srcAttr))
      .having(
        exprCountNotEqual,
        ...exprCountNotEqualArgs
      ).toString();

    logger.silly(
      `${this.name} #operatorNotEquals() queryCountUnequal`, queryCountUnequal);

    // Next we have to find all rows where we have values different to any
    // of operatorOptions. For the generationParents child attribute this
    // would mean any record where the parents plant id is unequal to any
    // of operatorOptions.
    let [exprNotIn, exprNotInArgs] = UtilsExpression
      .createNotInExpression(
        self.srcTable, self.srcAttr, operatorOptions);

    let queryNotIn = squel.select()
      .from(self.table)
      .field(Utils.explicitColumnRstr(self.table, self.srcAttr))
      .where(exprNotIn, ...exprNotInArgs).toString();

    logger.silly(`${this.name} #operatorNotEquals() queryNotIn`, queryNotIn);

    // Now combine both queries with an UNION and build the final
    // expression.
    // NOTE: We can't use the .union function from squel because it's not
    // compatible with sqlite3. Because of that we also wrap the queries
    // in a squel.rstr() to not have paranthesis around the query.
    // See https://github.com/hiddentao/squel/issues/335
    crit.crit = '? IN (? UNION ?)';
    crit.args = [
      Utils.explicitColumnRstr(self.srcTable, self.srcAttr),
      squel.rstr(queryCountUnequal),
      squel.rstr(queryNotIn)
    ];
  }

  /**
     * This operator lets you find records where the child attribute array
     * contains all elements of operatorOptions. The child attribute can also
     * contain more different elements.
     * To achieve this we select all child records which have any of operator
     * options elements in it, and from the selected we only keep those where
     * we had at least operatorOptions.length matches.
     * @param  {Object} self
     *         Object containing information about this translation process
     * @param  {Integer|Integer[]} operatorOptions
     *         We want to find records, where attribute value is not in
     *         this array.
     * @param  {Object} crit
     *         Object which contains expression and expressionArgs. Modify
     *         this two properties to create a new expression which gets
     *         added to self.squelExpr.
     */
  static operatorContains(self, operatorOptions, crit) {
    this.operatorIn(self, operatorOptions, crit);

    let [critHaving, critHavingArgs] = UtilsExpression.
      createGreaterThanEqualExpression(
        self.table, self.attr, operatorOptions.length || 1, 'COUNT');

    logger.silly(
      `${this.name} #operatorContains()`, critHaving, critHavingArgs);

    UtilsExpression.applyExpression(
      self.squelExprHaving, critHaving, critHavingArgs, self.type);
  }

  /**
     * This operator lets you select records where the child attribute doesn't
     * contain any of the elements in operatorOptions.
     * To achieve this behaviour we first select all records where any of the
     * operatorOptions elements is in, and then we select all records where
     * the id doesn't match with the previously selected.
     * @param  {Object} self
     *         Object containing information about this translation process
     * @param  {Integer|Integer[]} operatorOptions
     *         We want to find records, where attribute value is not in
     *         this array.
     * @param  {Object} crit
     *         Object which contains expression and expressionArgs. Modify
     *         this two properties to create a new expression which gets
     *         added to self.squelExpr.
     */
  static operatorNotContains(self, operatorOptions, crit) {
    if(!_.isArray(operatorOptions)) operatorOptions = [operatorOptions];

    // This query will first select all generations which have any parent
    // of operatorOptions and then select based on that all generations
    // which are not in that set of previously selected generations.

    let fieldParentGenerationIdRstr = Utils.explicitColumnRstr(
      self.table, self.srcAttr);

    let subQuery = squel.select()
      .from(self.table)
      .field(fieldParentGenerationIdRstr)
      .where(
        '? IN ?',
        Utils.explicitColumnRstr(self.table, self.attr),
        operatorOptions)
      .group(fieldParentGenerationIdRstr);

    crit.crit = '? NOT IN ?';
    crit.args = [fieldParentGenerationIdRstr, subQuery];
  }

  /**
     * This short hand should just does an equals operation, but we need to call
     * the TranslateOperatorsChildAttributes.operatorEquals() method,
     * therefore we need to reassign it.
     * @param  {Object} self
     *         Object containing information about this translation process
     * @param  {Object} crit
     *         Object which contains expression and expressionArgs. Modify
     *         this two properties to create a new expression which gets
     *         added to self.squelExpr.
     */
  static processStringNumberBooleanNullShortHand(self, crit) {
    super.operatorEquals(self, self.attrOptions, crit);
  }

  /**
     * And this short hand should does an equals operation, but we need to call
     * the TranslateOperatorsChildAttributes.operatorEquals() method,
     * therefore we need to reassign it.
     * @param  {Object} self
     *         Object containing information about this translation process
     * @param  {Object} crit
     *         Object which contains expression and expressionArgs. Modify
     *         this two properties to create a new expression which gets
     *         added to self.squelExpr.
     */
  static processArrayShortHand(self, crit) {
    this.operatorEquals(self, self.attrOptions, crit);
  }

  /**
     * Before we're done, we need to build a sub query were we select from the
     * child attributes destination table the id's we want to select in the
     * source table.
     * @param  {Object} self
     *         Object containing information about this translation process
     */
  static beforeDone(self) {
    // Make sure we have any expressions to add
    let emptySquelExpr = _.isEmpty(self.squelExpr._nodes);
    let emptySquelExprHaving = _.isEmpty(self.squelExprHaving._nodes);

    if(emptySquelExpr && emptySquelExprHaving) return;

    let subQuery = squel.select()
      .from(self.table)
      .field(Utils.explicitColumnRstr(self.table, self.srcAttr));


    if(!emptySquelExpr) subQuery.where(self.squelExpr);

    if(!emptySquelExprHaving) {
      subQuery
        .group(Utils.explicitColumnRstr(self.table, self.srcAttr))
        .having(self.squelExprHaving);
    }

    logger.silly('#applyCriteriaFilter #translateAndApplyChildAttributesOperators() subQuery:', subQuery.toString());

    UtilsExpression.applyExpression(
      self.squelExprOld,
      '? IN ?',
      [Utils.explicitColumnRstr(self.srcTable, self.srcAttr), subQuery],
      self.type
    );
  }
}

TranslateOperatorsChildAttributes.OPERATORS = _.clone(
  TranslateOperatorsRelational.OPERATORS);

// Overwrite our equals/not equals operatorFuncs for generationParents
TranslateOperatorsChildAttributes.OPERATORS.$eq =
    TranslateOperatorsChildAttributes.operatorEquals;
TranslateOperatorsChildAttributes.OPERATORS.$neq =
    TranslateOperatorsChildAttributes.operatorNotEquals;
TranslateOperatorsChildAttributes.OPERATORS.$contains =
    TranslateOperatorsChildAttributes.operatorContains;
TranslateOperatorsChildAttributes.OPERATORS.$ncontains =
    TranslateOperatorsChildAttributes.operatorNotContains;

module.exports = TranslateOperatorsChildAttributes;
