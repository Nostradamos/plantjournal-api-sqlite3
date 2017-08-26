'use strict';

const CONSTANTS = require('../../constants');
const Utils = require('../../utils');

const GenericCreate = require('../generic/generic-create');

class MediumCreate extends GenericCreate {
    /**
     * We need to validate the properties for new Medium.
     * @param  {object} context
     *         internal context object in #create().
     * @param  {object} options
     *         options object which got passed to GenericCreate.create().
     * @throws {Error}
     */
    static validateOptions(context, options) {
        Utils.hasToBeSet(options, CONSTANTS.ATTR_NAME_Medium);
        Utils.hasToBeString(options, CONSTANTS.ATTR_NAME_Medium);
        Utils.hasToBeString(options, CONSTANTS.ATTR_DESCRIPTION_Medium);
    }
}

MediumCreate.TABLE = CONSTANTS.TABLE_MediumS;

MediumCreate.ATTR_ID = CONSTANTS.ATTR_ID_Medium;

MediumCreate.ATTR_CREATED_AT = CONSTANTS.ATTR_CREATED_AT_Medium;

MediumCreate.ATTR_MODIFIED_AT = CONSTANTS.ATTR_MODIFIED_AT_Medium;

MediumCreate.ATTRIBUTES = CONSTANTS.ATTRIBUTES_Medium;

MediumCreate.DEFAULT_VALUES_ATTRIBUTES = {
    [CONSTANTS.ATTR_DESCRIPTION_Medium]: ''
};

MediumCreate.PLURAL = CONSTANTS.PLURAL_Medium;


module.exports = MediumCreate;
