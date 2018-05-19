'use strict';

const winston = require('winston');

function newLogger() {
  return new (winston.Logger)({
    transports: [
      new (winston.transports.Console)(),
      new (winston.transports.File)({ filename: 'plantjournal.log' })
    ],
    level: 'silly',
  });
}

module.exports = newLogger;
