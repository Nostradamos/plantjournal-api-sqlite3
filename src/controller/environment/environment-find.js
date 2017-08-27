'use strict';

const _ = require('lodash');

const CONSTANTS = require('../../constants');
const Utils = require('../../utils');

const GenericFind = require('../generic/generic-find');

class EnvironmentFind extends GenericFind {
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
        _.each(context.rowsWhere, function(row) {
            Utils.addEnvironmentFromRowToReturnObject(row, returnObject);
        });
    }
}

EnvironmentFind.TABLE = CONSTANTS.TABLE_ENVIRONMENT;

EnvironmentFind.ATTR_ID = CONSTANTS.ATTR_ID_ENVIRONMENT;

EnvironmentFind.ATTRIBUTES_SEARCHABLE = CONSTANTS.RELATED_ATTRIBUTES_ENVIRONMENT;

module.exports = EnvironmentFind;
