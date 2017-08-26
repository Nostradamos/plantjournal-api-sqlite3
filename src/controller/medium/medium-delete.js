'use strict';

const _ = require('lodash');

const logger = require('../../logger');
const CONSTANTS = require('../../constants');

const GenericDelete = require('../generic/generic-delete');

class MediumDelete extends GenericDelete {
    static setQueryRelatedJoin(context, criteria) {
        QueryUtils.joinPlantsFromMediums(context.queryRelated);
    }

    static setQueryRelatedFields(context, criteria) {
        context.queryRelated
            .field('mediums.mediumId')
            .field('plants.plantId');
    }

    static extractIdsToDelete(context, criteria) {
        context.mediumIdsToDelete = new Set();
        context.plantIdsToDelete = new Set();

        _.each(context.rowsRelated, function(row) {
            context.mediumIdsToDelete.add(row.mediumId);
            context.plantIdsToDelete.add(row.plantId);
        });

        context.mediumIdsToDelete = Utils.filterSetNotNull(context.mediumIdsToDelete);
        context.plantIdsToDelete = Utils.filterSetNotNull(context.plantIdsToDelete);

        logger.debug(this.name, '#delete() mediumIdsToDelete:', context.mediumIdsToDelete);
        logger.debug(this.name, '#delete() plantIdsToDelete:', context.plantIdsToDelete);
    }

    static setQueryDeleteWhere(context, criteria) {
        context.queryDelete
            .where('mediums.mediumId IN ?', context.mediumIdsToDelete);
    }

    static buildReturnObject(returnObject, context, criteria) {
        returnObject['mediums'] = context.mediumIdsToDelete;
        returnObject['plants'] = context.plantIdsToDelete;
    }
}
