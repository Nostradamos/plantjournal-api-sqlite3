'use strict';

const squel = require('squel');
const _ = require('lodash');
const QueryUtils = require('./utils-query');
const CONSTANTS = require('./constants');
const logger = require('./logger');

/**
 * Iterator function for any filter object where keys are attribute names and
 * values attribute criteria, or keys are boolean operators ($and, $or, $and(),
 * $or()). This function can call itself recursive.
 * Mutates squelExpr.
 * @param  {Object} obj
 *         Complete filter.where object or an child object of it. Object keys
 *         have to be $and/$or.. boolean operators or valid attributes. Eg:
 *         {'generationParents': [1,2],
 *          'or': {'familyId': 3}}
 * @param  {SquelExpression} squelExpr
 *         An Squel expression instance. You can init one with ```squel.exr()```.
 *         This function hopefully mutate this object (otherwise nothing
 *         productive happend).
 * @param  {Number} depth
 *         Number which indicates the recursion depth. If you start, start with
 *         1. Will get increased each time we do a recursion step.
 * @param  {String} [type=null]
 *         indicates which operator should get used for attributes. Normally
 *         you shouldn't pass any value to this, this function takes care of
 *         this by it's own. This get's modified for boolean operators.
 *         Valid types are null,'and','or'.
 *         null -> determine based on object type, if object is an array => 'or',
 *         otherwise 'and'.
 *         and  -> use and operator for attributes
 *         or   -> use or operator for attributes
 */
function eachFilterObject(obj, squelExpr, depth, type=null) {
    let isArray = _.isArray(obj);

    // Check if obj is array or dict
    if(_.isPlainObject(obj) === false && isArray === false) {
        throw new Error('Illegal object type:', obj);
    }

    // No type got specified, determine it based on obj type.
    // if obj is an array, it's normally an OR, otherwise AND.
    if(type === null) type = isArray ? 'or' : 'and';
    console.log(obj, depth, type);

    let attr, attrOptions;

    // iterate over every element, if obj is array, key will be index and
    // value the element. Otherwise normal key/value pair
    _.each(obj, function(value, key) {
        // If we have an array, value/element has to be an object. Just use
        // this function again on it
        if(isArray === true) {
            return eachFilterObject(value, squelExpr, depth+1, type);
        }

        [attr, attrOptions] = [key, value];

        console.log(attr, attrOptions);

        // Handle boolean operators
        if(attr == '$and') {
            return eachFilterObject(attrOptions, squelExpr, depth+1, 'and');
        } else if(attr == '$or') {
            return eachFilterObject(attrOptions, squelExpr, depth+1, 'or');
        } else if(attr === '$and()') {
            // $and() is a bit different, we want to have child criterias in a
            // sub expression
            let subSquelExpr = squel.expr();
            eachFilterObject(attrOptions, subSquelExpr, depth+1, 'and');
            applyCriteriaToExpression(squelExpr, subSquelExpr, [], 'and');
        } else if(attr === '$or()') {
            // $or() is a bit different, we want to have a child criterias in
            // a subexpression
            let subSquelExpr = squel.expr();
            eachFilterObject(attrOptions, subSquelExpr, depth+1, 'or');
            applyCriteriaToExpression(squelExpr, subSquelExpr, [], 'or');
        } else if(_.indexOf(allowedAttributes, attr) !== -1){
            translateAndApplyAttributeOptions(attr, attrOptions, squelExpr, type);
        // Handle normal attributes
        } else {
        // No boolean operator nor attribute, something's stinky here
            throw new Error('Illegal attribute: ' + attr);
        }
    });
}

/**
 * Helper method of #eachFilterObject(). This method "parses" the criteria
 * instructions for an attribute. So we handle things like $equals, $nequals,
 * $contains..., translate them into sql statements and apply them to squelExpr.
 * Mutates squelExpr.
 * @param  {String} attr
 *         Name of attribute. This has to be checked for validity.
 * @param  {Object|String|Integer|Array} attrOptions
 *         Attribute Options. Can be a lot. If it's an String/Integer we will
 *         understand it as an equals instruction. If it's an array, we understand
 *         it as "attribute has to be any of them" (except if attr is generationParents,
 *         this is a special case, see #handleGenerationParents()).
 *         If it's an Object it can have more detailed instructions like:
 *          - $eq     Attribute has to be equal to argument.
 *          - $neq    Attribute has to be different from argument.
 *          - $like   Argument has to be a valid sqlite like regexp and attribute
 *                    need
 *          - $nlike
 *          - $gt
 *          - $lt
 * @param  {[type]} squelExpr   [description]
 * @param  {[type]} type        [description]
 * @return {[type]}             [description]
 */
function translateAndApplyAttributeOptions(attr, attrOptions, squelExpr, type) {
    let crit, critArgs;

    // Get table for this attribute
    let table = QueryUtils.getTableOfField(attr);

    if(attr == 'generationParents') {
    // First handle special case generationParents
        [crit, critArgs] = handleGenerationParents(attrOptions);
    } else if(_.isInteger(attrOptions) || _.isString(attrOptions)) {
    // If attrOptions is an integer or a string, interpret it as a an $equals
    // criteria.
        [crit, critArgs] = createEqualsExpression(table, attr, attrOptions);
    } else if(_.isPlainObject(attrOptions)) {
        // Handle both cases for $equals, prefer $equals over $eq. We will always
        // prefer the longer version over the short one.
        // Two equals for the same attribute are bullshit.
        if(_.has(attrOptions, '$equals')) {
            [crit, critArgs] = createEqualsExpression(table, attr, attrOptions['$equals']);
        } else if(_.has(attrOptions, '$eq')) {
            [crit, critArgs] = createEqualsExpression(table, attr, attrOptions['$eq']);
        }
    } else {
    // Somethings fishy here. Throw an error?
    }

    if(crit !== null)
        applyCriteriaToExpression(squelExpr, crit, critArgs, type);
}

function createEqualsExpression(table, attr, toEqual) {
    return ['?.? = ?', [trable, attr, toEqual]];
}

function applyCriteriaToExpression(squelExpr, crit, critArgs, type) {
    if(type === 'and') {
        squelExpr.and(crit, ...critArgs);
    } else if (type === 'or') {
        squelExpr.or(crit, ...critArgs);
    } else {
        throw new Error('Illegal type: '+ type);
    }
}

function applyFilter(query, allowedAttributes, criteria) {
    this.allowedAttributes = allowedAttributes;
    let squelExpr = squel.expr();
    eachFilterObject.bind(this, criteria.filter, squelExpr, 1)();
    query.where(squelExpr);
}

module.exports =  applyFilter;
