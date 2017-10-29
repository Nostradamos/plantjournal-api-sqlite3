'use strict';

const CONSTANTS = require('../constants');
const UtilsExpression = require('../utils/utils-expression');

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
        if(self.attr.length > lengthAttrValue) {
            let charAfterAttr = self.attr[lengthAttrValue];

            // Make sure the first char after journalValue is a `.` (dot) or
            // `[` (bracket). If not, throw an errror.
            if (charAfterAttr !== '.' &&
                charAfterAttr !== '[') {
                throw new Error(
                    'Invalid JSON Path for attr: ' + self.attr + '. JSON ' +
                    'Paths have to start with "." or "[" but it starts with "' +
                    charAfterAttr + '"');
            }

            // We need to access the attribute path value with a function, so
            // we want sqlite expressions like this:
            // `json_extract($TABLE.$ATTR, $PATH)`
            self.func = 'JSON_EXTRACT';

            // JSON paths for sqlite have to start with an `$`
            self.funcArgs = ['$' + self.attr.substr(lengthAttrValue)];
            self.attr = CONSTANTS.ATTR_VALUE_JOURNAL;
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
            self.table, self.attr, operatorOptions, self.func, self.funcArgs);
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
            self.table, self.attr, operatorOptions, self.func, self.funcArgs);
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
            self.table, self.attr, operatorOptions, self.func, self.funcArgs);
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
            self.table, self.attr, operatorOptions, self.func, self.funcArgs);
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
            self.table, self.attr, operatorOptions, self.func, self.funcArgs);
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
        [crit.crit, crit.args] = UtilsExpression.
            createGreaterThanEqualExpression(self.table, self.attr,
                operatorOptions, self.func, self.funcArgs);
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
            self.table, self.attr, operatorOptions, self.func, self.funcArgs);
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
            self.table, self.attr, operatorOptions, self.func, self.funcArgs);
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
        [crit.crit, crit.args] = UtilsExpression.createInExpression(
            self.table, self.attr, operatorOptions, self.func, self.funcArgs);
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
        [crit.crit, crit.args] = UtilsExpression.createNotInExpression(
            self.table, self.attr, operatorOptions, self.func, self.funcArgs);
    }

    /**
     * This short hand should just do an equals operation, but we need to call
     * the TranslateOperatorsJournalValue.operatorEquals() method, therefore.
     * we need to reassign it.
     * @param  {Object} self
     *         Object containing information about this translation process
     * @param  {Object} crit
     *         Object which contains expression and expressionArgs. Modify
     *         this two properties to create a new expression which gets
     *         added to self.squelExpr.
     */
    static processStringNumberBooleanNullShortHand(self, crit) {
        this.operatorEquals(self, self.attrOptions, crit);
    }

    /**
     * And this short hand should do an IN operation, but we need to call
     * the TranslateOperatorsJournalValue.operatorEquals() method, therefore.
     * @param  {Object} self
     *         Object containing information about this translation process
     * @param  {Object} crit
     *         Object which contains expression and expressionArgs. Modify
     *         this two properties to create a new expression which gets
     *         added to self.squelExpr.
     */
    static processArrayShortHand(self, crit) {
        this.operatorIn(self, self.attrOptions, crit);
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
    '$nin': TranslateOperatorsJournalValue.operatorNotIn
};

module.exports = TranslateOperatorsJournalValue;
