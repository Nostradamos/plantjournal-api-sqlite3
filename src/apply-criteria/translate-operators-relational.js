'use strict';

const _ = require('lodash');

const logger = require('../logger');
const Utils = require('../utils');
const UtilsApplyCriteria = require('./utils-apply-criteria');
const UtilsQuery = require('../utils-query');

const TranslateOperatorsGeneric = require('./translate-operators-generic');


class TranslateOperatorsRelational extends TranslateOperatorsGeneric {
    static getTable(self) {
        self.table = UtilsQuery.getTableOfField(
            self.attr, self.selfSelf.overwriteTableLookup);
    }

    static registerOperators(self) {

    }

    static operatorEquals(self, operatorOptions, crit) {
        [crit.crit, crit.args] = UtilsApplyCriteria.createEqualsExpression(
            self.table, self.attr, operatorOptions);
    }

    static operatorNotEquals(self, operatorOptions, crit) {
        [crit.crit, crit.args] = UtilsApplyCriteria.createNotEqualsExpression(
            self.table, self.attr, operatorOptions);
    }

    static operatorLike(self, operatorOptions, crit) {
        [crit.crit, crit.args] = UtilsApplyCriteria.createLikeExpression(
            self.table, self.attr, operatorOptions);
    }

    static operatorNotLike(self, operatorOptions, crit) {
        [crit.crit, crit.args] = UtilsApplyCriteria.createNotLikeExpression(
            self.table, self.attr, operatorOptions);
    }

    static operatorGreatherThan(self, operatorOptions, crit) {
        [crit.crit, crit.args] = UtilsApplyCriteria.createGreaterThanExpression(
            self.table, self.attr, operatorOptions);
    }

    static operatorGreatherThanEqual(self, operatorOptions, crit) {
        [crit.crit, crit.args] = UtilsApplyCriteria.createGreaterThanEqualExpression(
            self.table, self.attr, operatorOptions);
    }

    static operatorLowerThan(self, operatorOptions, crit) {
        [crit.crit, crit.args] = UtilsApplyCriteria.createLowerThanExpression(
            self.table, self.attr, operatorOptions);
    }

    static operatorLowerThanEqual(self, operatorOptions, crit) {
        [crit.crit, crit.args] = UtilsApplyCriteria.createLowerThanEqualExpression(
            self.table, self.attr, operatorOptions);
    }

    static operatorIn(self, operatorOptions, crit) {
        [crit.crit, crit.args] = UtilsApplyCriteria.createInExpression(
            self.table, self.attr, operatorOptions);
    }

    static operatorNotIn(self, operatorOptions, crit) {
        [crit.crit, crit.args] = UtilsApplyCriteria.createNotInExpression(
            self.table, self.attr, operatorOptions);
    }

    static processStringNumberBooleanNullShortHand(self, crit) {
        [crit.crit, crit.args] = UtilsApplyCriteria.createEqualsExpression(
            self.table, self.attr, self.attrOptions);
    }

    static processArrayShortHand(self, crit) {
        [crit.crit, crit.args] = UtilsApplyCriteria.createInExpression(
            self.table, self.attr, self.attrOptions);
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
}

module.exports = TranslateOperatorsRelational;
