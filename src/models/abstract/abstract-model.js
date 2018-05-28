'use strict';

class AbstractModel {
  constructor(plantJournal) {
    this.plantJournal = plantJournal;
    
    let classNameLower = this.constructor.name.toLowerCase();
    let prefix = `../${classNameLower}/${classNameLower}-`;

    this.INSTANCE_ADD = new (require(prefix + 'add'))(this);
    this.INSTANCE_DELETE = null;
    this.INSTANCE_UPDATE = null;
    this.INSTANCE_FIND = null;
  }

  async add(...args) {
    return await this.INSTANCE_ADD.add(...args);
  }
}
module.exports = AbstractModel;
