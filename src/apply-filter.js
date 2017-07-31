const squel = require('squel');
const _ = require('lodash');
const QueryUtils = require('./utils-query');
const CONSTANTS = require('./constants');
const logger = require('./logger');


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

  let attr, attrOptions, crit, critArgs, table;

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
        // $and() is a bit different, we want to create a subexpression
        let subSquelExpr = squel.expr()
        eachFilterObject(attrOptions, subSquelExpr, depth+1, 'and');
        applyCriteriaToExpression(squelExpr, subSquelExpr, [], 'and');
      } else if(attr === '$or()') {
        // $or() is a bit different, we want to have a subexpression
        let subSquelExpr = squel.expr()
        eachFilterObject(attrOptions, subSquelExpr, depth+1, 'or');
        applyCriteriaToExpression(squelExpr, subSquelExpr, [], 'or');
      } else if(_.indexOf(allowedAttributes, attr) !== -1){
        // Handle normal attributes
        console.log(attr);
        table = QueryUtils.getTableOfField(attr);

        if(attr == 'generationParents') {
          [crit, critArgs] = handleGenerationParents(attrOptions);
        } else if(_.isInteger(attrOptions) || _.isString(attrOptions)) {
          crit = "?.? = ?";
          critArgs = [table, attr, attrOptions];
        }

        applyCriteriaToExpression(squelExpr, crit, critArgs, type);
      } else {
        // No boolean operator nor attribute, something's stinky here
        throw new Error('Illegal attribute: ' + attr);
      }
  });
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