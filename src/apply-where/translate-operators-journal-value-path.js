'use strict';

const _ = require('lodash');
const squel = require('squel');

const CONSTANTS = require('../constants');
const logger = require('../logger');
const UtilsExpression = require('../utils/utils-expression');

const TranslateOperatorsRelational = require(
    './translate-operators-relational');

class TranslateOperatorsJournalValuePath {
    static getTable(self) {
        self.table = CONSTANTS.TABLE_JOURNAL;
    }

    static modifySelf(self) {
        self.path = '$' + self.attr.substr(12);
        self.attr = 'journalValue';
    }

    static operatorEquals(self, operatorOptions, crit) {
        [crit.crit, crit.args] = UtilsExpression.createEqualsExpression(
            self.table, self.attr, self.path, operatorOptions, 'json_extract', self.path);
    }

    static operatorNotEquals(self, operatorOptions, crit) {
        [crit.crit, crit.args] = UtilsExpression.createNotEqualsExpression(
            self.table, self.attr, self.path, operatorOptions, 'json_extract', self.path);;
    }

    static operatorLike(self, operatorOptions, crit) {
        [crit.crit, crit.args] = UtilsExpression.createLikeExpression(
            self.table, self.attr, self.path, operatorOptions, 'json_extract', self.path);;
    }

    static operatorNotLike(self, operatorOptions, crit) {
        [crit.crit, crit.args] = UtilsExpression.createNotLikeExpression(
            self.table, self.attr, self.path, operatorOptions, 'json_extract', self.path);;
    }

    static operatorGreatherThan(self, operatorOptions, crit) {
        [crit.crit, crit.args] = UtilsExpression.createGreaterThanExpression(
            self.table, self.attr, self.path, operatorOptions, 'json_extract', self.path);;
    }

    static operatorGreatherThanEqual(self, operatorOptions, crit) {
        [crit.crit, crit.args] = UtilsExpression.createGreaterThanEqualExpression(
            self.table, self.attr, self.path, operatorOptions, 'json_extract', self.path);;
    }

    static operatorLowerThan(self, operatorOptions, crit) {
        [crit.crit, crit.args] = UtilsExpression.createLowerThanExpression(
            self.table, self.attr, self.path, operatorOptions, 'json_extract', self.path);;
    }

    static operatorLowerThanEqual(self, operatorOptions, crit) {
        [crit.crit, crit.args] = UtilsExpression.createLowerThanEqualExpression(
            self.table, self.attr, self.path, operatorOptions, 'json_extract', self.path);;
    }

    static operatorIn(self, operatorOptions, crit) {
        [crit.crit, crit.args] = UtilsExpression.createInExpression(
            self.table, self.attr, self.path, operatorOptions, 'json_extract', self.path);;
    }

    static operatorNotIn(self, operatorOptions, crit) {
        [crit.crit, crit.args] = UtilsExpression.createNotInExpression(
            self.table, self.attr, self.path, operatorOptions, 'json_extract', self.path);;
    }

    static processStringNumberBooleanNullShortHand(self, crit) {
        this.operatorEquals(self, self.attrOptions, crit);
    }

    static processArrayShortHand(self, crit) {
        this.operatorIn(self, self.attrOptions, crit);
    }

}

TranslateOperatorsJournalValuePath.OPERATORS = {
    '$eq': TranslateOperatorsJournalValuePath.operatorEquals,
    '$neq': TranslateOperatorsJournalValuePath.operatorNotEquals,
    '$like': TranslateOperatorsJournalValuePath.operatorLike,
    '$nlike': TranslateOperatorsJournalValuePath.operatorNotLike,
    '$gt': TranslateOperatorsJournalValuePath.operatorGreatherThan,
    '$gte': TranslateOperatorsJournalValuePath.operatorGreatherThanEqual,
    '$lt': TranslateOperatorsJournalValuePath.operatorLowerThan,
    '$lte': TranslateOperatorsJournalValuePath.operatorLowerThanEqual,
    '$in': TranslateOperatorsJournalValuePath.operatorIn,
    '$nin': TranslateOperatorsJournalValuePath.operatorNotIn
};

module.exports = TranslateOperatorsJournalValuePath;
