'use strict';

const UtilsExpression = require('../utils/utils-expression');
const UtilsQuery = require('../utils/utils-query');

const TranslateOperatorsGeneric = require('./translate-operators-generic');


class TranslateOperatorsRelational extends TranslateOperatorsGeneric {
    static getTable(self) {
        self.table = UtilsQuery.getTableOfField(
            self.attr, self.selfSelf.overwriteTableLookup);
    }

    static operatorEquals(self, operatorOptions, crit) {
        [crit.crit, crit.args] = UtilsExpression.createEqualsExpression(
            self.table, self.attr, operatorOptions);
    }

    static operatorNotEquals(self, operatorOptions, crit) {
        [crit.crit, crit.args] = UtilsExpression.createNotEqualsExpression(
            self.table, self.attr, operatorOptions);
    }

    static operatorLike(self, operatorOptions, crit) {
        [crit.crit, crit.args] = UtilsExpression.createLikeExpression(
            self.table, self.attr, operatorOptions);
    }

    static operatorNotLike(self, operatorOptions, crit) {
        [crit.crit, crit.args] = UtilsExpression.createNotLikeExpression(
            self.table, self.attr, operatorOptions);
    }

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
