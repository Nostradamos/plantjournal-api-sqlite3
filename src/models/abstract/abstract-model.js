'use strict';

class AbstractModel {
  constructor(plantJournal) {
    this.plantJournal = plantJournal;
    this.modelAdd = new this.constructor.CLASS_ADD(this);
    this.modelDelete = null;
    this.modelUpdate = null;
    this.modelFind = null;
  }

  async add(...args) {
    return await this.modelAdd.add(...args);
  }
}

AbstractModel.CLASS_ADD = require('./abstract-model-add');
AbstractModel.CLASS_DELETE = null;
AbstractModel.CLASS_UPDATE = null;
AbstractModel.CLASS_FIND = null;

module.exports = AbstractModel;
