'use strict';

const _ = require('lodash');

const logger = require('../../logger');
const CONSTANTS = require('../../constants');
const Utils = require('../../utils');
const QueryUtils = require('../../utils-query');

const GenericDelete = require('../generic/generic-delete');

class EnvironmentDelete extends GenericDelete {
    static setQueryRelatedJoin(context, criteria) {
        QueryUtils.joinMediumsFromEnvironments(context.queryRelated);
        QueryUtils.joinPlantsFromMediums(context.queryRelated);
    }

    static setQueryRelatedFields(context, criteria) {
        context.queryRelated
            .field('environments.environmentId')
            .field('mediums.mediumId')
            .field('plants.plantId');
    }

    static extractIdsToDelete(context, criteria) {
        context.environmentIdsToDelete = new Set();
        context.mediumIdsToDelete = new Set();
        context.plantIdsToDelete = new Set();

        _.each(context.rowsRelated, function(row) {
            context.environmentIdsToDelete.add(row.environmentId);
            context.mediumIdsToDelete.add(row.mediumId);
            context.plantIdsToDelete.add(row.plantId);
        });

        context.environmentIdsToDelete = Utils.filterSetNotNull(context.environmentIdsToDelete);
        context.mediumIdsToDelete = Utils.filterSetNotNull(context.mediumIdsToDelete);
        context.plantIdsToDelete = Utils.filterSetNotNull(context.plantIdsToDelete);

        logger.debug(this.name, '#delete() environmentIdsToDelete:', context.environmentIdsToDelete);
        logger.debug(this.name, '#delete() mediumIdsToDelete:', context.mediumIdsToDelete);
        logger.debug(this.name, '#delete() plantIdsToDelete:', context.plantIdsToDelete);
    }

    static setQueryDeleteWhere(context, criteria) {
        context.queryDelete
            .where('environments.environmentId IN ?', context.environmentIdsToDelete);
    }

    static buildReturnObject(returnObject, context, criteria) {
        returnObject['environments'] = context.environmentIdsToDelete;
        returnObject['mediums'] = context.mediumIdsToDelete;
        returnObject['plants'] = context.plantIdsToDelete;
    }
}

EnvironmentDelete.TABLE = CONSTANTS.TABLE_ENVIRONMENTS;

EnvironmentDelete.ATTRIBUTES_SEARCHABLE = CONSTANTS.RELATED_ATTRIBUTES_ENVIRONMENT;

module.exports = EnvironmentDelete;
