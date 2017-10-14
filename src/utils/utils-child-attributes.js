'use strict';

const CONSTANTS = require('../constants');

/**
 * UtilsChildAttributes.
 * @namespace
 */
let UtilsChildAttributes = exports;

/**
 * Check if attribute is an attribute containing information of a child model.
 * Eg: family is the parent, generation the child model. familyGenerations would
 * be a child attribute.
 * @param  {String} attr
 *         Attribute to check.
 * @return {Boolean}
 *         True if it's a child attribute.
 */
UtilsChildAttributes.isChildAttribute = function(attr) {
    return UtilsChildAttributes
        ._getTableSrcTableSrcAttrOfChildAttribute(attr) !== null;
};

UtilsChildAttributes.getTableOfChildAttribute = function(attr) {
    return UtilsChildAttributes
        ._getTableSrcTableSrcAttrOfChildAttribute(attr, 0);
};

UtilsChildAttributes._getTableSrcTableSrcAttrOfChildAttribute =
(attr, i=null) => {
    const childAttrMap = {
        [CONSTANTS.ATTR_GENERATIONS_FAMILY]: [
            CONSTANTS.TABLE_GENERATION,
            CONSTANTS.ATTR_ID_GENERATION,
            CONSTANTS.TABLE_FAMILY,
            CONSTANTS.ATTR_ID_FAMILY
        ],
        [CONSTANTS.ATTR_PARENTS_GENERATION]: [
            CONSTANTS.TABLE_GENERATION_PARENT,
            CONSTANTS.ATTR_ID_PLANT,
            CONSTANTS.TABLE_GENERATION,
            CONSTANTS.ATTR_ID_GENERATION
        ],
        [CONSTANTS.ATTR_GENOTYPES_GENERATION]: [
            CONSTANTS.TABLE_GENOTYPE,
            CONSTANTS.ATTR_ID_PLANT,
            CONSTANTS.TABLE_GENERATION,
            CONSTANTS.ATTR_ID_GENERATION
        ],
        [CONSTANTS.ATTR_PLANTS_GENOTYPE]: [
            CONSTANTS.TABLE_PLANT,
            CONSTANTS.ATTR_ID_PLANT,
            CONSTANTS.TABLE_GENOTYPE,
            CONSTANTS.ATTR_ID_GENOTYPE
        ],
        [CONSTANTS.ATTR_CLONES_PLANT]: [
            CONSTANTS.TABLE_PLANT,
            CONSTANTS.ATTR_ID_PLANT,
            CONSTANTS.TABLE_PLANT,
            CONSTANTS.ATTR_ID_PLANT
        ],
        [CONSTANTS.ATTR_MEDIUMS_ENVIRONMENT]: [
            CONSTANTS.TABLE_MEDIUM,
            CONSTANTS.ATTR_ID_MEDIUM,
            CONSTANTS.TABLE_ENVIRONMENT,
            CONSTANTS.ATTR_ID_ENVIRONMENT
        ],
        [CONSTANTS.ATTR_PLANTS_MEDIUM]: [
            CONSTANTS.TABLE_PLANT,
            CONSTANTS.ATTR_ID_PLANT,
            CONSTANTS.TABLE_MEDIUM,
            CONSTANTS.ATTR_ID_MEDIUM
        ]
    };
    let attrMapValue = childAttrMap[attr];
    if(attrMapValue === undefined) return null;
    return i !== null ? attrMapValue[i] : attrMapValue;
};
