'use strict';

class AbstractModelAdd {
  constructor(model) {
    this.model = model;
    this.knex = this.model.plantJournal.knex;
    this.logger = this.model.plantJournal.logger;
  }

  async add(options) {
  }
}

module.exports = AbstractModelAdd;
