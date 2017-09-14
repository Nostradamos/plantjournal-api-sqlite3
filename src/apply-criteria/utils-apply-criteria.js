'use strict';

const _ = require('lodash');


const UtilsApplyCriteria = exports;

/**
 * Helper function to apply a crit and critArgs pairs to squelExpr with
 * the wanted type (`and` or `or`).
 * @todo think of a better methodname
 * @param  {squelExpr} squelExpr    - squel expression builder to apply this
 *                                    sql expression with args too.
 * @param  {String|squelQuery} crit - criteria, can be a string
 * @param  {Object[]} critArgs      - Has be an array of values which can be used
 *                                    as arguments to the sql expression. Pass empty
 *                                    array if you don't want to pass any args.
 * @param  {String} type            - Type of logic operator. Can be `and` or `or`.
 */
UtilsApplyCriteria.applyCriteriaToExpression = function (squelExpr, crit, critArgs, type) {
    if (type === 'and') {
        squelExpr.and(crit, ...critArgs);
    } else if (type === 'or') {
        squelExpr.or(crit, ...critArgs);
    } else {
        throw new Error('Illegal type: '+ type);
    }
}

UtilsApplyCriteria.createGenericExpression = function(table, attr, operator, equal, func=null) {
    return [
        (func === null ? '?.? ' : func + '(?.?) ') + operator + ' ?',
        [table, attr, equal]
    ];
}

UtilsApplyCriteria.createIsNullExpression = function(table, attr) {
    return [
        '?.? IS NULL',
        [table, attr]
    ];
}

UtilsApplyCriteria.createIsNotNullExpression = function(table, attr) {
    return [
        '?.? IS NOT NULL',
        [table, attr]
    ];
}

UtilsApplyCriteria.createEqualsExpression = function(table, attr, toEqual, func=null) {
    if(_.isNull(toEqual)) return createIsNullExpression(table, attr);
    return UtilsApplyCriteria.createGenericExpression(table, attr, '=', toEqual, func);
}

UtilsApplyCriteria.createNotEqualsExpression = function(table, attr, notToEqual, func=null) {
    if(_.isNull(notToEqual)) return createIsNotNullExpression(table, attr);
    return UtilsApplyCriteria.createGenericExpression(table, attr, '!=', notToEqual, func);
}

UtilsApplyCriteria.createLikeExpression = function(table, attr, like, func=null) {
    return UtilsApplyCriteria.createGenericExpression(table, attr, 'LIKE', like, func);
}

UtilsApplyCriteria.createNotLikeExpression = function(table, attr, notLike, func=null) {
    return UtilsApplyCriteria.createGenericExpression(table, attr, 'NOT LIKE', notLike, func);
}

UtilsApplyCriteria.createGreaterThanExpression = function(table, attr, greaterThan, func=null) {
    return UtilsApplyCriteria.createGenericExpression(table, attr, '>', greaterThan, func);
}

UtilsApplyCriteria.createGreaterThanEqualExpression = function(table, attr, greaterThanEqual, func=null) {
    return UtilsApplyCriteria.createGenericExpression(table, attr, '>=', greaterThanEqual, func);
}

UtilsApplyCriteria.createLowerThanExpression = function(table, attr, lowerThan, func=null) {
    return UtilsApplyCriteria.createGenericExpression(table, attr, '<', lowerThan, func);
}

UtilsApplyCriteria.createLowerThanEqualExpression = function(table, attr, lowerThanEqual, func=null) {
    return UtilsApplyCriteria.createGenericExpression(table, attr, '<=', lowerThanEqual, func);
}

UtilsApplyCriteria.createInExpression = function(table, attr, inArr, func=null) {
    return UtilsApplyCriteria.createGenericExpression(table, attr, 'IN', inArr, func);
}

UtilsApplyCriteria.createNotInExpression = function (table, attr, notInArr, func=null) {
    return UtilsApplyCriteria.createGenericExpression(table, attr, 'NOT IN', notInArr, func);
}
