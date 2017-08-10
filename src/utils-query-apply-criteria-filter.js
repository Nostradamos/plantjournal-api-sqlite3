'use strict';

const _ = require('lodash');
const squel = require('squel');

const logger = require('./logger');
const QueryUtils = require('./utils-query');
const CONSTANTS = require('./constants');

/**
 * This function sets the filter parts for our queries and handles
 * many special cases. Mutates query.
 * You can use following operators (for generationParents only $and...$or() ftm):
 * Logical Operators:
 * $and       Logical AND operator
 * $or        Logical OR operator
 * $and()     Logical AND operator, but instructions will be in a sub expression
 * $or()      Logical OR operator, but instructions will be in a sub expression
 * Relational Operators:
 * $eq        Equivalence
 * $neq       Not equal
 * $like      Like operator, use regular expression format you know from sql
 * $nlike     Not like
 * $gt        Greater than
 * $gte       Greater than equal
 * $lt        Lower than
 * $lte       Lower than equal
 * $in        In array of values (simplifies long OR chains)
 * $nin       Non in array of values
 * @param  {squel} query
 *         squel query, needs to be in a state to take .where() calls
 * @param  {string[]} allowedAttributes
 *         An array of allowed attributes
 * @param  {Object} criteria
 *         criteria object which gets passed to update/delete/find functions.
 *         We only use the criteria.filter part, we ignore everything else.
 * @param  {Object.<String, Object>} [criteria.filter]
 *         This object holds all the control info for this function, not needed,
 *         but if you want this function to do a thing, this is needed.
 *         The key element has to be inside allowedFields, Otherwise it will
 *         get skipped. The Value can be a String, an integer or an array of
 *         strings/integers if you want that the value matches exactly.
 *         Eg: {filter: {'generationId': 1}} => generationId has to be 1
 *             {filter: {'generationParents': [1,2]}} => generationParents have
 *                                                      to be 1 and 2.
 *             {filter: {'plantSex': 'male'}} => only male plants
 */
function applyCriteriaFilter(query, allowedAttributes, criteria) {
    let squelExpr = squel.expr();

    eachFilterObject(criteria.filter, allowedAttributes, squelExpr, 1);
    query.where(squelExpr);
}


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
    logger.silly('#applyCriteriaFilter() #eachFilterObject() obj:', obj, 'depth:', depth, 'type:', type);
    let isArray = _.isArray(obj);

    // Check if obj is array or dict
    if (_.isPlainObject(obj) === false && isArray === false) {
        logger.warn('#applyCriteriaFilter() #eachFilterObject() Returning, illegal object type:', obj);
        return;
    }

    // No type got specified, determine it based on obj type.
    // if obj is an array, it's normally an OR, otherwise AND.
    if (type === null) type = isArray ? 'or' : 'and';

    let attr, attrOptions;

    // iterate over every element, if obj is array, key will be index and
    // value the element. Otherwise normal key/value pair
    _.each(obj, function(value, key) {
        // If we have an array, value/element has to be an object. Just use
        // this function again on it
        if (isArray === true) {
            return eachFilterObject(value, allowedAttributes, squelExpr, depth+1, type);
        }

        [attr, attrOptions] = [key, value];

        // Handle boolean operators
        if (attr === '$and') {
            return eachFilterObject(attrOptions, allowedAttributes, squelExpr, depth+1, 'and');
        } else if (attr === '$or') {
            return eachFilterObject(attrOptions, allowedAttributes, squelExpr, depth+1, 'or');
        } else if (attr === '$and()') {
            // $and() is a bit different, we want to have child criterias in a
            // sub expression
            let subSquelExpr = squel.expr();

            eachFilterObject(attrOptions, allowedAttributes, subSquelExpr, depth+1, 'and');
            applyCriteriaToExpression(squelExpr, subSquelExpr, [], 'and');
        } else if (attr === '$or()') {
            // $or() is a bit different, we want to have a child criterias in
            // a subexpression
            let subSquelExpr = squel.expr();

            eachFilterObject(attrOptions, allowedAttributes, subSquelExpr, depth+1, 'or');
            applyCriteriaToExpression(squelExpr, subSquelExpr, [], 'or');
        } else if (_.indexOf(allowedAttributes, attr) !== -1){
            translateAndApplyRelationalOperators(attr, attrOptions, squelExpr, type);
        // Handle normal attributes
        } else {
        // No boolean operator nor attribute, something's stinky here
            throw new Error('Illegal attribute or unknown logical operator: ' + attr);
        }
    });
}

/**
 * Helper method of #eachFilterObject(). This method "parses" the criteria
 * instructions for an attribute, translates the relational operators
 * like $eq, $neq, $in.. into sql expressions and applies them to the
 * given sqlExr. We also handle short hands. For generationParents
 * attribute we call the #handleGenerationParents() method.
 * Mutates squelExpr.
 * @param  {String} attr
 *         Name of attribute. This has to be checked for validity.
 * @param  {Object|String|Integer|Array} attrOptions
 *         Attribute Options. Can be a lot. If it's an String/Integer we will
 *         understand it as an equals instruction. If it's an array, we understand
 *         it as "attribute has to be any of them" (except if attr is generationParents,
 *         this is a special case, see #handleGenerationParents()).
 * @param  {squelExpr} squelExpr - squelExpr to apply where stuff to
 * @param  {String} type         - should be `and` or `or`, decides if we use
 *                                 squelExpr.and() or squelExpr.or().
 */
function translateAndApplyRelationalOperators(attr, attrOptions, squelExpr, type) {
    // Get table for this attribute
    let table = QueryUtils.getTableOfField(attr);

    if (attr === 'generationParents') {
    // First handle special case generationParents
        handleGenerationParents(attr, attrOptions, squelExpr, type);
        return;
    } else if (_.isInteger(attrOptions) || _.isString(attrOptions)) {
    // Short hand to easily do an equals operation if attrOptions is a string or an integer.
    // @ToDo: we should also do this for null.
        let [crit, critArgs] = createEqualsExpression(table, attr, attrOptions);

        applyCriteriaToExpression(squelExpr, crit, critArgs, type);
    } else if (_.isArray(attrOptions)) {
    // Short hand to easily do in operation if attrOptions is an array.
        let [crit, critArgs] = createInExpression(table, attr, attrOptions);

        applyCriteriaToExpression(squelExpr, crit, critArgs, type);
    } else if (_.isPlainObject(attrOptions)) {
        // Translate api operators into sql operators/expressions
        for (let operator in attrOptions) {
            // Iterate over all keys of attrOptions and translate relational
            // api operators into sql expressions
            let crit = null,
                critArgs;

            if (operator === '$eq') {
                [crit, critArgs] = createEqualsExpression(table, attr, attrOptions['$eq']);
            } else if (operator === '$neq') {
                [crit, critArgs] = createNotEqualsExpression(table, attr, attrOptions['$neq']);
            } else if (operator === '$like') {
                [crit, critArgs] = createLikeExpression(table, attr, attrOptions['$like']);
            } else if (operator === '$nlike') {
                [crit, critArgs] = createNotLikeExpression(table, attr, attrOptions['$nlike']);
            } else if (operator === '$gt') {
                [crit, critArgs] = createGreaterThanExpression(table, attr, attrOptions['$gt']);
            } else if (operator === '$gte') {
                [crit, critArgs] = createGreaterThanEqualExpression(table, attr, attrOptions['$gte']);
            } else if (operator === '$lt') {
                [crit, critArgs] = createLowerThanExpression(table, attr, attrOptions['$lt']);
            } else if (operator === '$lte') {
                [crit, critArgs] = createLowerThanEqualExpression(table, attr, attrOptions['$lte']);
            } else if (operator === '$in') {
                [crit, critArgs] = createInExpression(table, attr, attrOptions['$in']);
            } else if (operator === '$nin') {
                [crit, critArgs] = createNotInExpression(table, attr, attrOptions['$nin']);
            } else {
                throw new Error('Unknown relational operator: ' + operator);
            }
            // apply them to passed squel expression builder
            if (crit !== null) applyCriteriaToExpression(squelExpr, crit, critArgs, type);
        }
    } else {
    // Somethings fishy here. Throw an error?
        logger.warn('#applyCriteriaFilter() #translateAndApplyRelationalOperators() Don\'t know what to do with this attribute:', attr);
    }
}

/**
 * Helper method of #translateAndApplyRelationalOperators() for the generationParents
 * special case attribute. Because generationParents isn't only a column in our
 * database but an own table, we need to build sub queries which join this
 * table and perform our where filter on that subquery. Besides that
 * our short hands work a little bit different.
 * @param  {String} attr
 *         Name of attribute. This has to be checked for validity.
 * @param  {Object|String|Integer|Array} attrOptions
 *         Attribute Options. Can be a lot. If it's an String/Integer we will
 *         understand it as an equals instruction. If it's an array, we understand
 *         it as "attribute has to be any of them" (except if attr is generationParents,
 *         this is a special case, see #handleGenerationParents()).
 * @param  {squelExpr} squelExpr - squelExpr to apply where stuff to
 * @param  {String} type         - should be `and` or `or`, decides if we use
 *                                 squelExpr.and() or squelExpr.or().
 */
function handleGenerationParents(attr, attrOptions, squelExpr, type) {
    // generationParents is special. We want it to act like an array, so
    // a lot which works for other "normal" attributes, works not or differently
    // for generationParents.

    logger.silly('#applyCriteriaFilter #handleGenerationParents() attr:', attr, 'attrOptions:', attrOptions, 'type:', type);

    let table = CONSTANTS.TABLE_GENERATION_PARENTS;


    let subSquelExpr = squel.expr(); // expression for WHERE
    let subSquelExprHaving = squel.expr(); // expression for HAVING, mainly for count()

    if (_.isInteger(attrOptions) || _.isString(attrOptions)) {
    // Short hand for in.
        let [crit, critArgs] = createInExpression(table, CONSTANTS.ATTR_ID_PLANT, attrOptions);
        applyCriteriaToExpression(subSquelExpr, crit, critArgs, type);
    } else if (_.isArray(attrOptions)) {
    // Short hand for equals.
    // For arrays we want to make equals, this is just an IN like always, but with
    // a having count. This means we only select those generations, where all given
    // parent plantIds match exactly. No other parent plant more or less. This is
    // different from the other array handling, because we don't only look if any
    // parent is given. If you want that, use generationParents: {'$in'...}
        applyEqualsExpressionGenerationParents(
            subSquelExpr,
            subSquelExprHaving,
            table,
            CONSTANTS.ATTR_ID_PLANT,
            attrOptions,
            type
        );
    } else if (_.isPlainObject(attrOptions)) {
        for (let operator in attrOptions) {
            // Iterate over all keys of attrOptions and translate relational
            // api operators into sql expressions
            let crit = null,
                critArgs;

            if (operator === '$eq') {
                applyEqualsExpressionGenerationParents(
                    subSquelExpr,
                    subSquelExprHaving,
                    table,
                    CONSTANTS.ATTR_ID_PLANT,
                    attrOptions['$eq'],
                    type
                );
            } else if (operator === '$neq') {
                [crit, critArgs] = createNotInExpression(table, CONSTANTS.ATTR_ID_PLANT, attrOptions['$neq']);
            } else if (operator === '$like') {
                [crit, critArgs] = createLikeExpression(table, CONSTANTS.ATTR_ID_PLANT, attrOptions['$like']);
            } else if (operator === '$nlike') {
                [crit, critArgs] = createNotLikeExpression(table, CONSTANTS.ATTR_ID_PLANT, attrOptions['$nlike']);
            } else if (operator === '$gt') {
                [crit, critArgs] = createGreaterThanExpression(table, CONSTANTS.ATTR_ID_PLANT, attrOptions['$gt']);
            } else if (operator === '$gte') {
                [crit, critArgs] = createGreaterThanEqualExpression(table, CONSTANTS.ATTR_ID_PLANT, attrOptions['$gte']);
            } else if (operator === '$lt') {
                [crit, critArgs] = createLowerThanExpression(table, CONSTANTS.ATTR_ID_PLANT, attrOptions['$lt']);
            } else if (operator === '$lte') {
                [crit, critArgs] = createLowerThanEqualExpression(table, CONSTANTS.ATTR_ID_PLANT, attrOptions['$lte']);
            } else if (operator === '$in') {
                [crit, critArgs] = createInExpression(table, CONSTANTS.ATTR_ID_PLANT, attrOptions['$in']);
            } else if (operator === '$nin') {
                [crit, critArgs] = createNotInExpression(table, CONSTANTS.ATTR_ID_PLANT, attrOptions['$nin']);
            } else {
                throw new Error('Unknown relational operator: ' + operator);
            }
            // apply them to passed squel expression builder
            if(crit !== null) applyCriteriaToExpression(squelExpr, crit, critArgs, type);
        }
    } else {
    // Somethings fishy here. Throw an error?
        logger.warn('#applyCriteriaFilter #handleGenerationParents() Unknown type of generationParents options:', attrOptions);
        return;
    }

    let subQuery = squel.select()
        .from(CONSTANTS.TABLE_GENERATION_PARENTS, 'generation_parents')
        .field('generation_parents.generationId')
        .group('generation_parents.generationId')
        .where(subSquelExpr);

    subQuery.having(subSquelExprHaving);

    logger.silly('#applyCriteriaFilter #handleGenerationParents() generationParents subQuery:', subQuery.toString());

    applyCriteriaToExpression(
        squelExpr,
        '?.? IN ?',
        [CONSTANTS.TABLE_GENERATIONS,
            CONSTANTS.ATTR_ID_GENERATION,
            subQuery],
        type
    );
}

/********************
 * createExpression methods
 * The always return a an array with two elements. The first element is the sql
 * expression, the second an array of all place holder arguments for the sql expression.
 *
 * Even if they are one liner methods, we keep them in own methods because
 * of two reasons. The first reason is that we need them at different places,
 * for the special case generationParents and for "short hands" like attr:String/Integer
 * or attr:String[]. The second reason is that they could be more complicated, even
 * if they aren't for the moment.
 ********************/

function applyEqualsExpressionGenerationParents(squelExpr, squelExprHaving, table, attr, parentsToEqual, type) {
    let [critIn, critInArgs] = createInExpression(table, attr, parentsToEqual);
    let [critHaving, critHavingArgs] = createEqualsExpression(table, attr, parentsToEqual.length, 'count');
    applyCriteriaToExpression(squelExpr, critIn, critInArgs, type);
    applyCriteriaToExpression(squelExprHaving, critHaving, critHavingArgs, type);
}

function createGenericExpression(table, attr, operator, equal, func=null) {
    return [
        (func === null ? '?.? ' : func + '(?.?) ') + operator + ' ?',
        [table, attr, equal]
    ];

}

function createEqualsExpression(table, attr, toEqual, func=null) {
    return createGenericExpression(table, attr, '=', toEqual, func);
}

function createNotEqualsExpression(table, attr, notToEqual, func=null) {
    return createGenericExpression(table, attr, '!=', notToEqual, func);
}

function createLikeExpression(table, attr, like, func=null) {
    return createGenericExpression(table, attr, 'LIKE', like, func);
}

function createNotLikeExpression(table, attr, notLike, func=null) {
    return createGenericExpression(table, attr, 'NOT LIKE', notLike, func);
}

function createGreaterThanExpression(table, attr, greaterThan, func=null) {
    return createGenericExpression(table, attr, '>', greaterThan, func);
}

function createGreaterThanEqualExpression(table, attr, greaterThanEqual, func=null) {
    return createGenericExpression(table, attr, '>=', greaterThanEqual, func);
}

function createLowerThanExpression(table, attr, lowerThan, func=null) {
    return createGenericExpression(table, attr, '<', lowerThan, func);
}

function createLowerThanEqualExpression(table, attr, lowerThanEqual, func=null) {
    return createGenericExpression(table, attr, '<=', lowerThanEqual, func);
}

function createInExpression(table, attr, inArr, func=null) {
    return createGenericExpression(table, attr, 'IN', inArr, func);
}

function createNotInExpression(table, attr, notInArr, func=null) {
    return createGenericExpression(table, attr, 'NOT IN', notInArr, func);
}

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
function applyCriteriaToExpression(squelExpr, crit, critArgs, type) {
    if (type === 'and') {
        squelExpr.and(crit, ...critArgs);
    } else if (type === 'or') {
        squelExpr.or(crit, ...critArgs);
    } else {
        throw new Error('Illegal type: '+ type);
    }
}

module.exports =  applyCriteriaFilter;
