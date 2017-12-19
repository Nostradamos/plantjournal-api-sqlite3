'use strict';

const _ = require('lodash');

const Utils = require('./utils');

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
    throw new Error(`Illegal type: ${type}`);
  }
};

/**
 * Expression Builder
 * Let's you build complex expressions. An expression is the part of a sqlite3
 * query where you compare a table attribute with a value using a specific
 * operator.
 * @param  {String} tbl
 *         Table name Eg: 'generations', 'families'...
 * @param  {String} attr
 *         Name of the attribute/field Eg: 'generationId', 'generationName'..
 * @param  {String} operator
 *         Any valid sqlite3 operator Eg: 'LIKE', '!=', '>'...
 * @param  {String|Number|Array|Null} equal
 *         Value the operator on the attribute should be true for
 * @param  {String} [fnc=null]
 *         If you want to wrap table and attribute in a function use this.
 *         Eg: 'count', 'json_extract'...
 * @param  {Array} [fncArgs=null]
 *         If you need further args to the function, like a path to the
 *         json_extract function, set this to an array of args.
 * @return {Array} return
 *         Returns an array with two elements containing the expression
 *         and its args.
 * @return {String} return[0]
 *         The expression with placeholders for the args
 * @return {Array} return[1]
 *         The arguments for the various placeholders for the expression
 *
 */
UtilsExpression.createGenericExpression =
(tbl, attr, operator, equal=null, fnc=null, fncArgs=null) => {
  let expr = '';
  let exprArgs = [Utils.explicitColumnRstr(tbl, attr)];

  if(fnc === null) {
    expr += '?';
  } else {
    expr += fnc + '(?';
    if(fncArgs !== null) {
      expr += ', ' + _.chain('?, ')
        .repeat(fncArgs.length)
        .trimEnd(', ').value();
      exprArgs.push(...fncArgs);
    }
    expr += ')';
  }

  expr += ' ' + operator;
  if(equal !== null) {
    expr += ' ?';
    exprArgs.push(equal);
  }

  return [expr, exprArgs];
};

UtilsExpression.createIsNullExpression =
(tbl, attr, fnc=null, fncArgs=null) => {
  return UtilsExpression.createGenericExpression(
    tbl, attr, 'IS NULL', null, fnc, fncArgs);
};

UtilsExpression.createIsNotNullExpression =
(tbl, attr, fnc=null, fncArgs=null) => {
  return UtilsExpression.createGenericExpression(
    tbl, attr, 'IS NOT NULL', null, fnc, fncArgs);
};

UtilsExpression.createEqualsExpression =
(tbl, attr, toEqual, fnc=null, fncArgs=null) => {
  if(_.isNull(toEqual)) {
    return UtilsExpression.createIsNullExpression(tbl, attr);
  }
  return UtilsExpression.createGenericExpression(
    tbl, attr, '=', toEqual, fnc, fncArgs);
};

UtilsExpression.createNotEqualsExpression =
(tbl, attr, notToEqual, fnc=null, fncArgs=null) => {
  if(_.isNull(notToEqual)) {
    return UtilsExpression.createIsNotNullExpression(tbl, attr);
  }
  return UtilsExpression.createGenericExpression(
    tbl, attr, '!=', notToEqual, fnc, fncArgs);
};

UtilsExpression.createLikeExpression =
(tbl, attr, like, fnc=null, fncArgs=null) => {
  return UtilsExpression.createGenericExpression(
    tbl, attr, 'LIKE', like, fnc, fncArgs);
};

UtilsExpression.createNotLikeExpression =
(tbl, attr, notLike, fnc=null, fncArgs=null) => {
  return UtilsExpression.createGenericExpression(
    tbl, attr, 'NOT LIKE', notLike, fnc, fncArgs);
};

UtilsExpression.createGreaterThanExpression =
(tbl, attr, greaterThan, fnc=null, fncArgs=null) => {
  return UtilsExpression.createGenericExpression(
    tbl, attr, '>', greaterThan, fnc, fncArgs);
};

UtilsExpression.createGreaterThanEqualExpression =
(tbl, attr, greaterThanEqual, fnc=null, fncArgs=null) => {
  return UtilsExpression.createGenericExpression(
    tbl, attr, '>=', greaterThanEqual, fnc, fncArgs);
};

UtilsExpression.createLowerThanExpression =
(tbl, attr, lowerThan, fnc=null, fncArgs=null) => {
  return UtilsExpression.createGenericExpression(
    tbl, attr, '<', lowerThan, fnc, fncArgs);
};

UtilsExpression.createLowerThanEqualExpression =
(tbl, attr, lowerThanEqual, fnc=null, fncArgs=null) => {
  return UtilsExpression.createGenericExpression(
    tbl, attr, '<=', lowerThanEqual, fnc, fncArgs);
};

UtilsExpression.createInExpression =
(tbl, attr, inArr, fnc=null, fncArgs=null) => {
  if(_.isInteger(inArr)) inArr = [inArr];
  return UtilsExpression.createGenericExpression(
    tbl, attr, 'IN', inArr, fnc, fncArgs);
};

UtilsExpression.createNotInExpression =
(tbl, attr, notInArr, fnc=null, fncArgs=null) => {
  if(_.isInteger(notInArr)) notInArr = [notInArr];
  return UtilsExpression.createGenericExpression(
    tbl, attr, 'NOT IN', notInArr, fnc, fncArgs);
};

UtilsExpression.createExistsExpression = (subQuery) => {
  return ['EXISTS ?', [subQuery]];
};

UtilsExpression.createNotExistsExpression = (subQuery) => {
  return ['NOT EXISTS ?', [subQuery]];
};
