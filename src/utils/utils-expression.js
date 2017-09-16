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

UtilsExpression.createGenericExpression = function(table, attr, operator, equal, func=null, funcArgs=null) {
    let expr = '';
    let exprArgs = [table, attr];

    if(func === null) {
        expr += '?.?';
    } else {
        expr += func + '(?.?';
        if(funcArgs !== null) {
            expr += ', ' + _.chain('?, ')
                .repeat(funcArgs.length)
                .trimEnd(', ').value();
            exprArgs.push(...funcArgs);
        }
        expr += ')';
    }

    expr += ' ' + operator + ' ?';
    exprArgs.push(equal);

    return [expr, exprArgs];
};

UtilsExpression.createIsNullExpression = function(table, attr, func=null, funcArgs=null) {
    return UtilsExpression.createGenericExpression(
        table, attr, 'IS', null, func, funcArgs);
};

UtilsExpression.createIsNotNullExpression = function(table, attr, func=null, funcArgs=null) {
    return UtilsExpression.createGenericExpression(
        table, attr, 'IS NOT', null, func, funcArgs);
};

UtilsExpression.createEqualsExpression = function(table, attr, toEqual, func=null, funcArgs=null) {
    if(_.isNull(toEqual)) {
        return UtilsExpression.createIsNullExpression(table, attr);
    }
    return UtilsExpression.createGenericExpression(table, attr, '=', toEqual, func, funcArgs);
};

UtilsExpression.createNotEqualsExpression = function(table, attr, notToEqual, func=null, funcArgs=null) {
    if(_.isNull(notToEqual)) {
        return UtilsExpression.createIsNotNullExpression(table, attr);
    }
    return UtilsExpression.createGenericExpression(table, attr, '!=', notToEqual, func, funcArgs);
};

UtilsExpression.createLikeExpression = function(table, attr, like, func=null, funcArgs=null) {
    return UtilsExpression.createGenericExpression(table, attr, 'LIKE', like, func, funcArgs);
};

UtilsExpression.createNotLikeExpression = function(table, attr, notLike, func=null, funcArgs=null) {
    return UtilsExpression.createGenericExpression(table, attr, 'NOT LIKE', notLike, func, funcArgs);
};

UtilsExpression.createGreaterThanExpression = function(table, attr, greaterThan, func=null, funcArgs=null) {
    return UtilsExpression.createGenericExpression(table, attr, '>', greaterThan, func, funcArgs);
};

UtilsExpression.createGreaterThanEqualExpression = function(table, attr, greaterThanEqual, func=null, funcArgs=null) {
    return UtilsExpression.createGenericExpression(table, attr, '>=', greaterThanEqual, func, funcArgs);
};

UtilsExpression.createLowerThanExpression = function(table, attr, lowerThan, func=null, funcArgs=null) {
    return UtilsExpression.createGenericExpression(table, attr, '<', lowerThan, func, funcArgs);
};

UtilsExpression.createLowerThanEqualExpression = function(table, attr, lowerThanEqual, func=null, funcArgs=null) {
    return UtilsExpression.createGenericExpression(table, attr, '<=', lowerThanEqual, func, funcArgs);
};

UtilsExpression.createInExpression = function(table, attr, inArr, func=null, funcArgs=null) {
    return UtilsExpression.createGenericExpression(table, attr, 'IN', inArr, func, funcArgs);
};

UtilsExpression.createNotInExpression = function (table, attr, notInArr, func=null, funcArgs=null) {
    return UtilsExpression.createGenericExpression(table, attr, 'NOT IN', notInArr, func, funcArgs);
};
