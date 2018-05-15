'use strict';

const CONSTANTS = require('../../constants');
const Utils = require('../../utils/utils');

const GenericAdd = require('../generic/generic-add');

class AttachmentAdd extends GenericAdd {

  static validate(self, context) {
    let options = context.options;

    Utils.hasToBeSet(options, CONSTANTS.ATTR_FILENAME_ATTACHMENT);
    Utils.hasToBeString(options, CONSTANTS.ATTR_FILENAME_ATTACHMENT);
  }
}


AttachmentAdd.TABLE = CONSTANTS.TABLE_ATTACHMENT;

AttachmentAdd.ATTR_ID = CONSTANTS.ATTR_ID_ATTACHMENT;

AttachmentAdd.ATTR_ADDED_AT = CONSTANTS.ATTR_ADDED_AT_ATTACHMENT;

AttachmentAdd.ATTR_MODIFIED_AT = CONSTANTS.ATTR_MODIFIED_AT_ATTACHMENT;

AttachmentAdd.ATTRIBUTES = CONSTANTS.ATTRIBUTES_ATTACHMENT;

AttachmentAdd.PLURAL = CONSTANTS.PLURAL_ATTACHMENT;

module.exports = AttachmentAdd;
