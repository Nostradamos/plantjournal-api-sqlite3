'use strict';

const _ = require('lodash');

const logger = require('../../logger');
const CONSTANTS = require('../../constants');
const Utils = require('../../utils');
const QueryUtils = require('../../utils-query');

const GenericDelete = require('../generic/generic-delete');

/**
 * This class extends {@link GenericDelete} to fit the needs for Medium
 * deletions. The delete() method gets called internally from Medium.delete().
 * If you want to know how delete works internally, see
 * {@link GenericCreate|src/controller/generic/generic-create}.
 * If you want to know how to use the Medium.delete()
 * API from outside, see {@link Genotype|src/models/Medium #delete()}.
 * @private
 * @extends GenericDelete
 */
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

MediumDelete.TABLE = CONSTANTS.TABLE_MEDIUMS;

MediumDelete.ATTRIBUTES_SEARCHABLE = CONSTANTS.RELATED_ATTRIBUTES_MEDIUM;

module.exports = MediumDelete;