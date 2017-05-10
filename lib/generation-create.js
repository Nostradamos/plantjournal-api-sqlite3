'use strict';

const CONSTANTS = require('./constants');
const GenericCreate = require('./generic-create');
const logger = require('./logger');
const squel = require('squel');
const Utils = require('./utils');


class GenerationCreate extends GenericCreate {

}

GenerationCreate.name = "GenerationCreate";
GenerationCreate.table = CONSTANTS.TABLE_GENERATIONS;
