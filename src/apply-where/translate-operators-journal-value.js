'use strict';

const _ = require('lodash');
const squel = require('squel');

const CONSTANTS = require('../constants');
const logger = require('../logger');
const UtilsExpression = require('../utils/utils-expression');

const TranslateOperatorsRelational = require(
    './translate-operators-relational');

class TranslateOperatorsJournalValue extends TranslateOperatorsRelational {
    static getTable(self) {
        self.table = CONSTANTS.TABLE_JOURNAL;
    }

    static modifySelf(self) {
        self.func = null;
        self.funcArgs = null;

        let lengthAttrValue = CONSTANTS.ATTR_VALUE_JOURNAL.length;
        console.log("hallo");
        if(self.attr.length > lengthAttrValue) {
            let charAfterAttr = self.attr[lengthAttrValue];
            if (charAfterAttr !== "."&&
                charAfterAttr !== "[") {
                throw new Error(
                    'Invalid JSON Path for attr: ' + self.attr + '. JSON ' +
                    'Paths have to start with "." or "[" but it starts with "' +
                    charAfterAttr + '"');
            }
            self.func = 'json_extract';
            self.funcArgs = ['$' + self.attr.substr(lengthAttrValue)];
            self.attr = 'journalValue';
        }
    }

    static operatorEquals(self, operatorOptions, crit) {
        [crit.crit, crit.args] = UtilsExpression.createEqualsExpression(
            self.table, self.attr, operatorOptions, self.func, self.funcArgs);
    }

    static operatorNotEquals(self, operatorOptions, crit) {
        [crit.crit, crit.args] = UtilsExpression.createNotEqualsExpression(
            self.table, self.attr, operatorOptions, self.func, self.funcArgs);;
    }

    static operatorLike(self, operatorOptions, crit) {
        [crit.crit, crit.args] = UtilsExpression.createLikeExpression(
            self.table, self.attr, operatorOptions, self.func, self.funcArgs);;
    }

    static operatorNotLike(self, operatorOptions, crit) {
        [crit.crit, crit.args] = UtilsExpression.createNotLikeExpression(
            self.table, self.attr, operatorOptions, self.func, self.funcArgs);;
    }

    static operatorGreatherThan(self, operatorOptions, crit) {
        [crit.crit, crit.args] = UtilsExpression.createGreaterThanExpression(
            self.table, self.attr, operatorOptions, self.func, self.funcArgs);;
    }

    static operatorGreatherThanEqual(self, operatorOptions, crit) {
        [crit.crit, crit.args] = UtilsExpression.createGreaterThanEqualExpression(
            self.table, self.attr, operatorOptions, self.func, self.funcArgs);;
    }

    static operatorLowerThan(self, operatorOptions, crit) {
        [crit.crit, crit.args] = UtilsExpression.createLowerThanExpression(
            self.table, self.attr, operatorOptions, self.func, self.funcArgs);;
    }

    static operatorLowerThanEqual(self, operatorOptions, crit) {
        [crit.crit, crit.args] = UtilsExpression.createLowerThanEqualExpression(
            self.table, self.attr, operatorOptions, self.func, self.funcArgs);;
    }

    static operatorIn(self, operatorOptions, crit) {
        [crit.crit, crit.args] = UtilsExpression.createInExpression(
            self.table, self.attr, operatorOptions, self.func, self.funcArgs);;
    }

    static operatorNotIn(self, operatorOptions, crit) {
        [crit.crit, crit.args] = UtilsExpression.createNotInExpression(
            self.table, self.attr, operatorOptions, self.func, self.funcArgs);;
    }

    static processStringNumberBooleanNullShortHand(self, crit) {
        this.operatorEquals(self, self.attrOptions, crit);
    }

    static processArrayShortHand(self, crit) {
        this.operatorIn(self, self.attrOptions, crit);
    }

}

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
