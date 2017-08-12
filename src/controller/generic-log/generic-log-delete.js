'use strict';

const logger = require('../../logger');

const GenericDelete = require('../generic/generic-delete');

class GenericLogDelete extends GenericDelete {
    static setQueryRelatedFields(context, criteria) {
        context.queryRelated
            .field(this.ATTR_ID);
    }

    static extractIdsToDelete(context, criteria) {
        context.logsToDelete = [];

        for(let row of context.rowsRelated) {
            context.logsToDelete.push(
                row[this.ATTR_ID]
            );
        }

        logger.debug(this.name, '#delete() logsToDelete:', context.logsToDelete);
    }

    static setQueryDeleteWhere(context, criteria) {
        context.queryDelete.where(
            '?.? IN ?',
            this.TABLE,
            this.ATTR_ID,
            context.logsToDelete
        );
    }

    static buildReturnObject(returnObject, context, criteria) {
        returnObject[this.PLURAL] = context.logsToDelete;
    }
}

GenericLogDelete.TABLE;

GenericLogDelete.ATTRIBUTES_SEARCHABLE;

GenericLogDelete.ATTR_ID;

GenericLogDelete.PLURAL;

module.exports = GenericLogDelete;
