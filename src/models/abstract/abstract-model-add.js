'use strict';

class AbstractModelAdd {
  constructor(model) {
    this.model = model;
    this.knex = this.model.plantJournal.knex;
    this.logger = this.model.plantJournal.logger;
    console.log('Constructor!');
  }

  async add(options) {
    this.logger.debug(`${this.name} #create() options:`, JSON.stringify(options));
    Utils.hasToBeAssocArray(options);
  
    let context = {
      options,
      returnObject: {},
      createdAt: Utils.getDatetimeUTC(),
      creatingClassName: this.name,
      insertIds: {},
    };

    let classStackAndSelfs = this.resolveClassStackAndBuildSelfs(context);

    this.logger.debug(`${this.name} #create() classStack:`, _.map(classStackAndSelfs.classStack, e => e.name));

    classStackAndSelfs = await this
      .callClassStackValidationMethods(classStackAndSelfs, context);

    await this.callClassStackRemainingMethods(classStackAndSelfs, context);


    logger.debug(this.name, '#create() returnObject:', JSON.stringify(context.returnObject));
    return context.returnObject;
  }
  
  /**
   * This function inits the self.query squel object.
   * By default it will be an insert query and the table will be this.TABLE.
   * Overwrite this if you want to init more than one query or you're not happy
   * with the default behaviour.
   * @param  {object} self
   *         Namespace/object only for the context of this class and this
   *         creation process. Not shared across differenct classes in
   *         classStack.
   * @param  {object} context
   *         Namespace/object of this creation process. It's shared across
   *         all classes in classStack.
   */
  initQuery(self, context) {
    self.query = squel.insert().into(this.TABLE);
  }
}
module.exports = AbstractModelAdd;
