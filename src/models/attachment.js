'use strict';

const AttachmentAdd = require('./attachment/attachment-add');

var Attachment = {};

Attachment.add = async function(options) {
  return await AttachmentAdd.add(options);
};

module.exports = Attachment;
