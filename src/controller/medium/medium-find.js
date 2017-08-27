'use strict';

const _ = require('lodash');

const CONSTANTS = require('../../constants');
const Utils = require('../../utils');
const QueryUtils = require('../../utils-query');

const GenericFind = require('../generic/generic-find');

class MediumFind extends GenericFind {
    /**
     * We need to join families table, so that we can for example also find
     * generations based on their family name.
     * @param  {object} context
     *         Internal context object
     * @param  {object} criteria
     *         Criteria object passed to find()
     */
    static setQueryWhereJoin(context, criteria) {
        // Joins families, and because of the true flag also generation_parents.
        QueryUtils.joinRelatedMediums(context.queryWhere, true);
    }

    /**
     * We need to overwrite this method to, yeah, build the returnObject. We
     * basically iterate over each row we get from database and add all
     * environment related attributes to returnObject.environments.
     * @override
     * @param  {object} returnObject
     *         object which will get returned later from #find().
     * @param  {object} context
     *         Internal context object
     *         Criteria object passed to find()
     */
    static buildReturnObjectWhere(returnObject, context, criteria) {
        // build families object
        returnObject.environments =  {};
        returnObject.mediums = {};
        _.each(context.rowsWhere, function(row) {
            Utils.addMediumFromRowToReturnObject(row, returnObject);
            Utils.addEnvironmentFromRowToReturnObject(row, returnObject);
        });

        Utils.deleteEmptyProperties(returnObject, ['environments']);
    }
}

MediumFind.TABLE = CONSTANTS.TABLE_MEDIUMS;

MediumFind.ATTR_ID = CONSTANTS.ATTR_ID_MEDIUM;

MediumFind.ATTRIBUTES_SEARCHABLE = CONSTANTS.RELATED_ATTRIBUTES_MEDIUM;

MediumFind.OVERWRITE_TABLE_LOOKUP = {
    [CONSTANTS.ATTR_ID_ENVIRONMENT]: CONSTANTS.TABLE_MEDIUMS
};

module.exports = MediumFind;
