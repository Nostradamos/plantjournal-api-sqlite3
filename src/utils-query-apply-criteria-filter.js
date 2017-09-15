'use strict';

const applyFilter = require('./apply-criteria/apply-criteria');

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
    applyFilter(query, allowedAttributes, criteria, overwriteTableLookup);
}

module.exports = applyCriteriaFilter;
