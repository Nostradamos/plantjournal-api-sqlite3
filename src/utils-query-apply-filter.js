'use strict';

const _ = require('lodash');
const squel = require('squel');

const logger = require('./logger');
const QueryUtils = require('./utils-query');
const CONSTANTS = require('./constants');

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
 * @param  {String[]} allowedAttributes
 *         String array of allowed attributes. It will throw an error if you
 *         use an attribute which is illegal.
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
function eachFilterObject(obj, allowedAttributes, squelExpr,depth, type=null) {
    logger.silly('#applyFilter() #eachFilterObject() obj:', obj, 'depth:', depth, 'type:', type);
    let isArray = _.isArray(obj);

    // Check if obj is array or dict
    if(_.isPlainObject(obj) === false && isArray === false) {
        return logger.warn('#applyFilter() #eachFilterObject() Returning, illegal object type:', obj);
    }

    // No type got specified, determine it based on obj type.
    // if obj is an array, it's normally an OR, otherwise AND.
    if(type === null) type = isArray ? 'or' : 'and';

    let attr, attrOptions;

    // iterate over every element, if obj is array, key will be index and
    // value the element. Otherwise normal key/value pair
    _.each(obj, function(value, key) {
        // If we have an array, value/element has to be an object. Just use
        // this function again on it
        if(isArray === true) {
            return eachFilterObject(value, allowedAttributes, squelExpr, depth+1, type);
        }

        [attr, attrOptions] = [key, value];

        console.log(attr, attrOptions);

        // Handle boolean operators
        if(attr == '$and') {
            return eachFilterObject(attrOptions, allowedAttributes, squelExpr, depth+1, 'and');
        } else if(attr == '$or') {
            return eachFilterObject(attrOptions, allowedAttributes, squelExpr, depth+1, 'or');
        } else if(attr === '$and()') {
            // $and() is a bit different, we want to have child criterias in a
            // sub expression
            let subSquelExpr = squel.expr();
            eachFilterObject(attrOptions, allowedAttributes, subSquelExpr, depth+1, 'and');
            applyCriteriaToExpression(squelExpr, subSquelExpr, [], 'and');
        } else if(attr === '$or()') {
            // $or() is a bit different, we want to have a child criterias in
            // a subexpression
            let subSquelExpr = squel.expr();
            eachFilterObject(attrOptions, allowedAttributes, subSquelExpr, depth+1, 'or');
            applyCriteriaToExpression(squelExpr, subSquelExpr, [], 'or');
        } else if(_.indexOf(allowedAttributes, attr) !== -1){
            translateAndApplyAttributeOptions(attr, attrOptions, squelExpr, type);
        // Handle normal attributes
        } else {
        // No boolean operator nor attribute, something's stinky here
            logger.warn('#applyFilter() #eachFilterObject() Illegal attribute: ' + attr);
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
 *          - $eq
 *          - $neq    Records value for attribute has to be different from argument.
 *          - $like   Records value for argument has to be a valid sqlite like regexp and attribute
 *                    need
 *          - $nlike
 *          - $gt
 *          - $lt
 * @param  {[type]} squelExpr   [description]
 * @param  {[type]} type        [description]
 * @return {[type]}             [description]
 */
function translateAndApplyAttributeOptions(attr, attrOptions, squelExpr, type) {
    // Get table for this attribute
    let table = QueryUtils.getTableOfField(attr);

    if(attr == 'generationParents') {
    // First handle special case generationParents
        return handleGenerationParents(attr, attrOptions, squelExpr, type);
    } else if(_.isInteger(attrOptions) || _.isString(attrOptions)) {
    // If attrOptions is an integer or a string, interpret it as a an $equals
    // criteria.
        let [crit, critArgs] = createEqualsExpression(table, attr, attrOptions);
        applyCriteriaToExpression(squelExpr, crit, critArgs, type);
    } else if(_.isArray(attrOptions)) {
        let [crit, critArgs] = createInExpression(table, attr, attrOptions);
        applyCriteriaToExpression(squelExpr, crit, critArgs, type);
    } else if(_.isPlainObject(attrOptions)) {
        // Translate api operators into sql operators/expressions
        for(let operator in attrOptions) {
            let crit = null,
                critArgs;
            if(operator === '$eq') {
                [crit, critArgs] = createEqualsExpression(table, attr, attrOptions['$eq']);
            } else if(operator === '$neq') {
                [crit, critArgs] = createNotEqualsExpression(table, attr, attrOptions['$neq']);
            } else if(operator === '$like') {
                [crit, critArgs] = createLikeExpression(table, attr, attrOptions['$like']);
            } else if(operator === '$nlike') {
                [crit, critArgs] = createNotLikeExpression(table, attr, attrOptions['$nlike']);
            } else if(operator === '$gt') {
                [crit, critArgs] = createGreaterThanExpression(table, attr, attrOptions['$gt']);
            } else if(operator === '$gte') {
                [crit, critArgs] = createGreaterThanEqualExpression(table, attr, attrOptions['$gte']);
            } else if(operator === '$lt') {
                [crit, critArgs] = createLowerThanExpression(table, attr, attrOptions['$lt']);
            } else if(operator === '$lte') {
                [crit, critArgs] = createLowerThanEqualExpression(table, attr, attrOptions['$lte']);
            } else if(operator === '$in') {
                [crit, critArgs] = createInExpression(table, attr, attrOptions['$in']);
            } else if(operator === '$nin') {
                [crit, critArgs] = createNotInExpression(table, attr, attrOptions['$nin']);
            } else {
                logger.warn('Unknown operator:', operator);
            }
            if(crit !== null) applyCriteriaToExpression(squelExpr, crit, critArgs, type);
        }
    } else {
    // Somethings fishy here. Throw an error?
      logger.warn('#applyFilter() #translateAndApplyAttributeOptions() Don\'t know what to do with this attribute:', attr);
    }
}

function handleGenerationParents(attr, attrOptions, squelExpr, type) {
    // generationParents is special. We want it to act like an array, so
    // a lot which works for other "normal" attributes, works not or differently
    // for generationParents.

    logger.silly('#applyFilter #handleGenerationParents() attr:', attr, 'attrOptions:', attrOptions, 'type:', type);

    let table = CONSTANTS.TABLE_GENERATION_PARENTS;
    let havingCount = null;

    let subSquelExpr = squel.expr();

    if(_.isArray(attrOptions)) {
    // For arrays we want to make equals, this is just an IN like always, but with
    // a having count. This means we only select those generations, where all given
    // parent plantIds match exactly. No other parent plant more or less. This is
    // different from the other array handling, because we don't only look if any
    // parent is given. If you want that, use generationParents: {'$in'...}
        let [crit, critArgs] = createInExpression(table, CONSTANTS.ATTR_ID_PLANT, attrOptions);
        applyCriteriaToExpression(subSquelExpr, crit, critArgs, type);
        havingCount = attrOptions.length;
    } else {
    // Somethings fishy here. Throw an error?
      return logger.warn('#applyFilter #handleGenerationParents() Unknown type of generationParents options:', attrOptions);
    }


    let subQuery = squel.select()
      .from(CONSTANTS.TABLE_GENERATION_PARENTS, 'generation_parents')
      .field('generation_parents.generationId')
      .group('generation_parents.generationId')
      .where(subSquelExpr);

     if(havingCount !== null) {
         subQuery.having('count(generation_parents.plantId) = ?', havingCount);
     }

    logger.silly('#applyFilter #handleGenerationParents() generationParents subQuery:', subQuery.toString());


    applyCriteriaToExpression(
        squelExpr,
        '?.? IN ?',
        [CONSTANTS.TABLE_GENERATIONS, CONSTANTS.ATTR_ID_GENERATION, subQuery],
        type
    );
}

function createEqualsExpression(table, attr, toEqual) {
    return ['?.? = ?', [table, attr, toEqual]];
}

function createNotEqualsExpression(table, attr, notToEqual) {
    return ['?.? != ?', [table, attr, notToEqual]];
}

function createLikeExpression(table, attr, notToEqual) {
    return ['?.? LIKE ?', [table, attr, notToEqual]];
}

function createNotLikeExpression(table, attr, notToEqual) {
    return ['?.? NOT LIKE ?', [table, attr, notToEqual]];
}

function createGreaterThanExpression(table, attr, greaterThan) {
    return ['?.? > ?', [table, attr, greaterThan]];
}

function createGreaterThanEqualExpression(table, attr, greaterThanEqual) {
    return ['?.? >= ?', [table, attr, greaterThanEqual]];
}

function createLowerThanExpression(table, attr, lowerThan) {
    return ['?.? < ?', [table, attr, lowerThan]];
}

function createLowerThanEqualExpression(table, attr, lowerThanEqual) {
    return ['?.? <= ?', [table, attr, lowerThanEqual]];
}

function createInExpression(table, attr, inArr) {
    return ['?.? IN ?', [table, attr, inArr]]
}

function createNotInExpression(table, attr, inArr) {
    return ['?.? NOT IN ?', [table, attr, inArr]]
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
    let squelExpr = squel.expr();
    eachFilterObject(criteria.filter, allowedAttributes, squelExpr, 1);
    query.where(squelExpr);
}

module.exports =  applyFilter;
