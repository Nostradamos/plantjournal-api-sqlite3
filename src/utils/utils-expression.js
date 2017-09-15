'use strict';

const _ = require('lodash');


const UtilsExpression = exports;

/**
 * Helper function to apply a expr and exprArgs pairs to squelExpr with
 * the wanted type (`and` or `or`).
 * @todo think of a better methodname
 * @param  {squelExpr} squelExpr    - squel expression builder to apply this
 *                                    sql expression with args too.
 * @param  {String|squelQuery} expr - expreria, can be a string
 * @param  {Object[]} exprArgs      - Has be an array of values which can be used
 *                                    as arguments to the sql expression. Pass empty
 *                                    array if you don't want to pass any args.
 * @param  {String} type            - Type of logic operator. Can be `and` or `or`.
 */
UtilsExpression.applyExpression = function (squelExpr, expr, exprArgs, type) {
    if (type === 'and') {
        squelExpr.and(expr, ...exprArgs);
    } else if (type === 'or') {
        squelExpr.or(expr, ...exprArgs);
    } else {
        throw new Error('Illegal type: '+ type);
    }
};

UtilsExpression.createGenericExpression = function(table, attr, operator, equal, func=null) {
    return [
        (func === null ? '?.? ' : func + '(?.?) ') + operator + ' ?',
        [table, attr, equal]
    ];
};

UtilsExpression.createIsNullExpression = function(table, attr) {
    return [
        '?.? IS NULL',
        [table, attr]
    ];
};

UtilsExpression.createIsNotNullExpression = function(table, attr) {
    return [
        '?.? IS NOT NULL',
        [table, attr]
    ];
};

UtilsExpression.createEqualsExpression = function(table, attr, toEqual, func=null) {
    if(_.isNull(toEqual)) {
        return UtilsExpression.createIsNullExpression(table, attr);
    }
    return UtilsExpression.createGenericExpression(table, attr, '=', toEqual, func);
};

UtilsExpression.createNotEqualsExpression = function(table, attr, notToEqual, func=null) {
    if(_.isNull(notToEqual)) {
        return UtilsExpression.createIsNotNullExpression(table, attr);
    }
    return UtilsExpression.createGenericExpression(table, attr, '!=', notToEqual, func);
};

UtilsExpression.createLikeExpression = function(table, attr, like, func=null) {
    return UtilsExpression.createGenericExpression(table, attr, 'LIKE', like, func);
};

UtilsExpression.createNotLikeExpression = function(table, attr, notLike, func=null) {
    return UtilsExpression.createGenericExpression(table, attr, 'NOT LIKE', notLike, func);
};

UtilsExpression.createGreaterThanExpression = function(table, attr, greaterThan, func=null) {
    return UtilsExpression.createGenericExpression(table, attr, '>', greaterThan, func);
};

UtilsExpression.createGreaterThanEqualExpression = function(table, attr, greaterThanEqual, func=null) {
    return UtilsExpression.createGenericExpression(table, attr, '>=', greaterThanEqual, func);
};

UtilsExpression.createLowerThanExpression = function(table, attr, lowerThan, func=null) {
    return UtilsExpression.createGenericExpression(table, attr, '<', lowerThan, func);
};

UtilsExpression.createLowerThanEqualExpression = function(table, attr, lowerThanEqual, func=null) {
    return UtilsExpression.createGenericExpression(table, attr, '<=', lowerThanEqual, func);
};

UtilsExpression.createInExpression = function(table, attr, inArr, func=null) {
    return UtilsExpression.createGenericExpression(table, attr, 'IN', inArr, func);
};

UtilsExpression.createNotInExpression = function (table, attr, notInArr, func=null) {
    return UtilsExpression.createGenericExpression(table, attr, 'NOT IN', notInArr, func);
};
