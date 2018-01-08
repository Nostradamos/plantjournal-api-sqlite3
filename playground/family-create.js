const squel = require('squel');

const Utils = require('./utils/utils');

const logger = require('../src/logger');

var getSelfsAndCallStackCache = {};
function getSelfsAndCallStack(obj) {
  let cached = getSelfsAndCallStackCache[obj];
  if(cached) return cached;

  let [callStack, selfs] = [[obj],[{}]];

  let rP = obj.PARENT;
  while(rP) {
    callStack.unshift(rP);
    selfs.push({});
    rP = rP.PARENT;
  }

  let returnValue = [selfs, callStack];
  getSelfsAndCallStackCache[obj] = returnValue;
  return returnValue;
}

class GenericCreate {
  static create(options) {
    let [selfs, callStack] = getSelfsAndCallStack(this);
    logger.debug(`${this.name} #create() callStack`, callStack.toString());

    let functions = [
      'validate',
      'initQuery',
      'setQueryFields',
      'setQueryCreatedAtAndModifiedAtFields'
      'stringifyQuery',
      'beginTransaction',
      'execute',
      'endTransaction',
      'buildReturnObject'
    ];

    for(let f of functions) {
      for(let i=0;i<callStack.length;i++) {
        if(callStack[i][f](selfs[i], context) === 1) {
          [selfs, callStack] = [selfs.splice(i+1), callStack.splice(i+1)];
        }

        // Make sure we execute begin/endTransaction only once
        if(f === 'beginTransaction' || f === 'endTransaction') break;
      }
    }

    return context.returnObject;
  }

  static validateOptions(options) {
    Utils.hasToBeAssocArray(options);
  }

  static initContext(options) {
    return {
      returnObject: {},
      createdAt: Utils.getUnixTimestampUTC()
    };
  }

  static validate(self, context) {
    throw new Error('GenericCreate #validate needs to be overwritten');
  }

  static initQuery(self, context) {
    console.log(this.TABLE);
    self.query = squel.insert().into(this.TABLE);
  }

  static setQueryCreatedAtAndModifiedAtFields(self, context) {
    logger.debug(`${this.name} #setQueryCreatedAtAndModifiedAt() createdAt: ${context.createdAt}`);

    self.query
      .set(this.ATTR_CREATED_AT, context.createdAt)
      .set(this.ATTR_MODIFIED_AT, context.createdAt);
  }

  static setQueryFields(self, context) {
    for(let attr of this.ATTRIBUTES) {
      if (_.indexOf(this.SKIP_ATTRIBUTES, attr) !== -1) {
        continue;
      } else if (!_.isUndefined(context[attr])) {
        self.query.set(attr, context[attr]);
      } else if (!_.isUndefined(options[attr])) {
        self.query.set(attr, options[attr]);
      } else if (!_.isUndefined(this.DEFAULT_VALUES_ATTRIBUTES[attr])) {
        self.query.set(attr, this.DEFAULT_VALUES_ATTRIBUTES[attr]);
      } else {
        self.query.set(attr, null);
      }
    }

    // set id field
    context.query.set(this.ATTR_ID, null);
  }

  static stringifyQuery(self, context) {
    self.queryStr = self.query.toString();
    logger.debug(`${this.name} #stringifyQuery() query string: ${self.query}`);
  }

  static beginTransaction(self, context) {

  }

  static execute(self, context) {
    console.log('Generic execute');
  }

  static rollbackTransaction(self, context) {

  }

  static endTransaction(self, context) {

  }

  static buildReturnObject(self, context) {

  }
}

GenericCreate.PARENT = false;
GenericCreate.TABLE = null;
GenericCreate.ATTR_CREATED_AT = null;
GenericCreate.ATTR_MODIFIED_AT = null;

class FamilyCreate extends GenericCreate {
  static validate(self, context) {
    console.log('Family validate');
  }

  static execute(self, context) {
    console.log('Family execute');
  }
}

FamilyCreate.TABLE = 'family';
FamilyCreate.ATTR_CREATED_AT = 'familyCreatedAt';
FamilyCreate.ATTR_MODIFIED_AT = 'familyModifiedAt';

class GenerationCreate extends GenericCreate {
  static validate(self, context) {
    console.log('Generation validate');
  }

  static execute(self, context) {
    console.log('Generation execute');
  }
}

GenerationCreate.PARENT = FamilyCreate;
GenerationCreate.TABLE = 'generation';
GenerationCreate.ATTR_CREATED_AT = 'generationCreatedAt';
GenerationCreate.ATTR_MODIFIED_AT = 'generationModifiedAt';

GenerationCreate.create({});
