'use strict';

const _ = require('lodash');


const UtilsExpression = exports;

/**
 * Helper fnction to apply a expr and exprArgs pairs to squelExpr with
 * the wanted type (`and` or `or`).
 * @todo think of a better methodname
 * @param  {squelExpr} squelExpr
 *         squel expression builder to apply this sql expression with args too.
 * @param  {String|squelQuery} expr
 *         expression, can be a string
 * @param  {Object[]} exprArgs
 *         Has be an array of values which can be used as arguments to the sql
 *         expression. Pass empty array if you don't want to pass any args.
 * @param  {String} type
 *         Type of logic operator. Can be `and` or `or`.
 */
UtilsExpression.applyExpression = (squelExpr, expr, exprArgs, type) => {
    if (type === 'and') {
        squelExpr.and(expr, ...exprArgs);
    } else if (type === 'or') {
        squelExpr.or(expr, ...exprArgs);
    } else {
        throw new Error('Illegal type: '+ type);
    }
};

UtilsExpression.createGenericExpression = (tbl, attr, operator, equal, fnc=null, fncArgs=null) => {
    let expr = '';
    let exprArgs = [tbl, attr];

    if(fnc === null) {
        expr += '?.?';
    } else {
        expr += fnc + '(?.?';
        if(fncArgs !== null) {
            expr += ', ' + _.chain('?, ')
                .repeat(fncArgs.length)
                .trimEnd(', ').value();
            exprArgs.push(...fncArgs);
        }
        expr += ')';
    }

    expr += ' ' + operator + ' ?';
    exprArgs.push(equal);

    return [expr, exprArgs];
};

UtilsExpression.createIsNullExpression = (tbl, attr, fnc=null, fncArgs=null) => {
    return UtilsExpression.createGenericExpression(
        tbl, attr, 'IS', null, fnc, fncArgs);
};

UtilsExpression.createIsNotNullExpression = (tbl, attr, fnc=null, fncArgs=null) => {
    return UtilsExpression.createGenericExpression(
        tbl, attr, 'IS NOT', null, fnc, fncArgs);
};

UtilsExpression.createEqualsExpression = (tbl, attr, toEqual, fnc=null, fncArgs=null) => {
    if(_.isNull(toEqual)) {
        return UtilsExpression.createIsNullExpression(tbl, attr);
    }
    return UtilsExpression.createGenericExpression(tbl, attr, '=', toEqual, fnc, fncArgs);
};

UtilsExpression.createNotEqualsExpression = (tbl, attr, notToEqual, fnc=null, fncArgs=null) => {
    if(_.isNull(notToEqual)) {
        return UtilsExpression.createIsNotNullExpression(tbl, attr);
    }
    return UtilsExpression.createGenericExpression(tbl, attr, '!=', notToEqual, fnc, fncArgs);
};

UtilsExpression.createLikeExpression = (tbl, attr, like, fnc=null, fncArgs=null) => {
    return UtilsExpression.createGenericExpression(tbl, attr, 'LIKE', like, fnc, fncArgs);
};

UtilsExpression.createNotLikeExpression = (tbl, attr, notLike, fnc=null, fncArgs=null) => {
    return UtilsExpression.createGenericExpression(tbl, attr, 'NOT LIKE', notLike, fnc, fncArgs);
};

UtilsExpression.createGreaterThanExpression = (tbl, attr, greaterThan, fnc=null, fncArgs=null) => {
    return UtilsExpression.createGenericExpression(tbl, attr, '>', greaterThan, fnc, fncArgs);
};

UtilsExpression.createGreaterThanEqualExpression = (tbl, attr, greaterThanEqual, fnc=null, fncArgs=null) => {
    return UtilsExpression.createGenericExpression(tbl, attr, '>=', greaterThanEqual, fnc, fncArgs);
};

UtilsExpression.createLowerThanExpression = (tbl, attr, lowerThan, fnc=null, fncArgs=null) => {
    return UtilsExpression.createGenericExpression(tbl, attr, '<', lowerThan, fnc, fncArgs);
};

UtilsExpression.createLowerThanEqualExpression = (tbl, attr, lowerThanEqual, fnc=null, fncArgs=null) => {
    return UtilsExpression.createGenericExpression(tbl, attr, '<=', lowerThanEqual, fnc, fncArgs);
};

UtilsExpression.createInExpression = (tbl, attr, inArr, fnc=null, fncArgs=null) => {
    return UtilsExpression.createGenericExpression(tbl, attr, 'IN', inArr, fnc, fncArgs);
};

UtilsExpression.createNotInExpression = (tbl, attr, notInArr, fnc=null, fncArgs=null) => {
    return UtilsExpression.createGenericExpression(tbl, attr, 'NOT IN', notInArr, fnc, fncArgs);
};
