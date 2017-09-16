'use strict';

const _ = require('lodash');
const squel = require('squel');

const CONSTANTS = require('../constants');
const logger = require('../logger');
const UtilsExpression = require('../utils/utils-expression');

const TranslateOperatorsRelational = require(
    './translate-operators-relational');
const TranslateOperatorsGenerationParents = require(
    './translate-operators-generation-parents');
const TranslateOperatorsJournalValue = require(
    './translate-operators-journal-value');

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
 * @param  {string[]} self.allowedAttributes
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
 * @param {Dict} [self.overwriteTableLookup=null]
 *        If you want to overwrite the used table for specific attributes, set
 *        them here. Key should be the attribute, value the new table.
 */
function applyCriteriaFilter(query, allowedAttributes, criteria, overwriteTableLookup = null) {
    let self = {
        query: query,
        allowedAttributes: allowedAttributes,
        overwriteTableLookup: overwriteTableLookup,
        tablesToJoin: new Set()
    };

    let squelExpr = squel.expr();
    eachFilterObject(self, criteria.filter, squelExpr, 1, null);

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
 * @param  {String[]} self.allowedAttributes
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
 * @param {Dict} [self.overwriteTableLookup=null]
 *        If you want to overwrite the used table for specific attributes, set
 *        them here. Key should be the attribute, value the new table.
 */
function eachFilterObject(self, obj, squelExpr, depth, type=null) {
    logger.silly(
        '#applyCriteriaFilter() #eachFilterObject() obj:', obj, 'depth:', depth,
        'type:', type);

    let isArray = _.isArray(obj);

    // Check if obj is array or dict
    if (_.isPlainObject(obj) === false && isArray === false) {
        logger.warn(
            '#applyCriteriaFilter() #eachFilterObject() Returning, illegal ' +
            'object type:', obj);
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
            return eachFilterObject(self, value, squelExpr, depth, type);
        }

        [attr, attrOptions] = [key, value];

        // Handle boolean operators
        if (attr === '$and') {
            eachFilterObject(self, attrOptions, squelExpr, depth+1, 'and');
        } else if (attr === '$or') {
            eachFilterObject(self, attrOptions, squelExpr, depth+1, 'or');
        } else if (attr === '$and()') {
        // $and() is a bit different, we want to have child criterias in a
        // sub expression
            let subSquelExpr = squel.expr();

            eachFilterObject(self, attrOptions, subSquelExpr, depth+1, 'and');
            UtilsExpression.applyExpression(
                squelExpr, subSquelExpr, [], 'and');
        } else if (attr === '$or()') {
        // $or() is a bit different, we want to have a child criterias in
        // a subexpression
            let subSquelExpr = squel.expr();

            eachFilterObject(self, attrOptions, subSquelExpr, depth+1, 'or');
            UtilsExpression.applyExpression(
                squelExpr, subSquelExpr, [], 'or');
        } else {
        // Handle normal attributes
            translateAndApplyOperators(
                self, attr, attrOptions, squelExpr, type);
        }
    });
}

/**
 * Helper method of #eachFilterObject().
 * This method
 * Mutates squelExpr.
 * @param  {Object} self
 * @param  {String} attr
 *         Name of attribute. This has to be checked for validity.
 * @param  {Object|String|Integer|Array} attrOptions
 *         Attribute Options. Can be a lot. If it's an String/Integer we will
 *         understand it as an equals instruction. If it's an array, we understand
 *         it as "attribute has to be any of them" (except if attr is generationParents,
 *         this is a special case, see #translateAndApplyGenerationParentsOperators()).
 * @param  {squelExpr} squelExpr
 *         squelExpr to apply where stuff to
 * @param  {String} type
 *         should be `and` or `or`, decides if we use squelExpr.and() or
 *         squelExpr.or().
 * @param {Dict} [self.overwriteTableLookup=null]
 *        If you want to overwrite the used table for specific attributes, set
 *        them here. Key should be the attribute, value the new table.
 */
function translateAndApplyOperators(self, attr, attrOptions, squelExpr, type) {
    let translator = null;
    // Check if we have special cases
    if (attr === CONSTANTS.ATTR_PARENTS_GENERATION) {
        translator = TranslateOperatorsGenerationParents;
    } else if (_.startsWith(attr, CONSTANTS.ATTR_VALUE_JOURNAL)) {
    // This is something starting with journalValue, special case
        translator = TranslateOperatorsJournalValue;
    } else if (_.indexOf(self.allowedAttributes, attr) !== -1){
        translator = TranslateOperatorsRelational;
    } else {
        throw new Error(
            'Illegal attribute or unknown logical operator: ' + attr);
    }

    translator.translateAndApplyOperators(
        self, attr, attrOptions, squelExpr, type);
}

module.exports = applyCriteriaFilter;
