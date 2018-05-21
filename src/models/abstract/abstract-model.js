'use strict';

class AbstractModel {
  constructor(plantJournal) {
    this.plantJournal = plantJournal;
    this.INSTANCE_ADD = new this.constructor.CLASS_ADD(this);
    this.INSTANCE_DELETE = null;
    this.INSTANCE_UPDATE = null;
    this.INSTANCE_FIND = null;
  }

  async add(...args) {
    return await this.INSTANCE_ADD.add(...args);
  }
}

AbstractModel.CLASS_ADD = require('./abstract-model-add');
AbstractModel.CLASS_DELETE = null;
AbstractModel.CLASS_UPDATE = null;
AbstractModel.CLASS_FIND = null;

module.exports = AbstractModel;
