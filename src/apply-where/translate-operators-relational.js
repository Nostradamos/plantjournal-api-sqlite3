'use strict';

const UtilsExpression = require('../utils/utils-expression');
const UtilsQuery = require('../utils/utils-query');

const TranslateOperatorsGeneric = require('./translate-operators-generic');

/**
 * Translator class which has all basic relational operators implemented
 * and is used for the majority of attributes.
 */
class TranslateOperatorsRelational extends TranslateOperatorsGeneric {
    /**
     * We need to get the table based on the attribute
     * @param  {Object} self
     *         Object containing information about this translation process
     */
    static getTable(self) {
        self.table = UtilsQuery.getTableOfField(
            self.attr, self.selfSelf.overwriteTableLookup);
    }

    /**
     * Operator function for equals ($eq)
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
            self.table, self.attr, operatorOptions);
    }


    /**
     * Operator function for equals NOT ($neq)
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
            self.table, self.attr, operatorOptions);
    }


    /**
     * Operator function for like ($like). Like is an relational operator
     * which matches a bit similiar to regexpressions, but a lot simpler.
     * Basically you have to special chars `_` and `%`. `_` matches exactly
     * one character, no whether which one. `%` matches zero or more characters.
     * For example if you want to check if an attribute contains the sub String
     * 'sensor' at any position, you could do following:
     * `{attribute: {$like: '%sensor%'}}`
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
            self.table, self.attr, operatorOptions);
    }

    /**
     * Operator function for NOT like ($nlike)
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
            self.table, self.attr, operatorOptions);
    }

    /**
     * Operator function for greater than ($gt)
     * @param  {Object} self
     *         Object containing information about this translation process
     * @param  {String|Number|Boolean|Null} operatorOptions
     *         We want to find records, where attribute value is NOT like this.
     * @param  {Object} crit
     *         Object which contains expression and expressionArgs. Modify
     *         this two properties to create a new expression which gets
     *         added to self.squelExpr.
     */
    static operatorGreatherThan(self, operatorOptions, crit) {
        [crit.crit, crit.args] = UtilsExpression.createGreaterThanExpression(
            self.table, self.attr, operatorOptions);
    }

    static operatorGreatherThanEqual(self, operatorOptions, crit) {
        [crit.crit, crit.args] = UtilsExpression.createGreaterThanEqualExpression(
            self.table, self.attr, operatorOptions);
    }

    static operatorLowerThan(self, operatorOptions, crit) {
        [crit.crit, crit.args] = UtilsExpression.createLowerThanExpression(
            self.table, self.attr, operatorOptions);
    }

    static operatorLowerThanEqual(self, operatorOptions, crit) {
        [crit.crit, crit.args] = UtilsExpression.createLowerThanEqualExpression(
            self.table, self.attr, operatorOptions);
    }

    static operatorIn(self, operatorOptions, crit) {
        [crit.crit, crit.args] = UtilsExpression.createInExpression(
            self.table, self.attr, operatorOptions);
    }

    static operatorNotIn(self, operatorOptions, crit) {
        [crit.crit, crit.args] = UtilsExpression.createNotInExpression(
            self.table, self.attr, operatorOptions);
    }

    static processStringNumberBooleanNullShortHand(self, crit) {
        this.operatorEquals(self, self.attrOptions, crit);
    }

    static processArrayShortHand(self, crit) {
        this.operatorIn(self, self.attrOptions, crit);
    }
}

TranslateOperatorsRelational.OPERATORS = {
    '$eq': TranslateOperatorsRelational.operatorEquals,
    '$neq': TranslateOperatorsRelational.operatorNotEquals,
    '$like': TranslateOperatorsRelational.operatorLike,
    '$nlike': TranslateOperatorsRelational.operatorNotLike,
    '$gt': TranslateOperatorsRelational.operatorGreatherThan,
    '$gte': TranslateOperatorsRelational.operatorGreatherThanEqual,
    '$lt': TranslateOperatorsRelational.operatorLowerThan,
    '$lte': TranslateOperatorsRelational.operatorLowerThanEqual,
    '$in': TranslateOperatorsRelational.operatorIn,
    '$nin': TranslateOperatorsRelational.operatorNotIn
};

module.exports = TranslateOperatorsRelational;
