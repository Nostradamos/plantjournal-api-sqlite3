'use strict';

const winston = require('winston');

var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)(), new (winston.transports.File)({ filename: 'plantjournal.log' })
    ],
    level: 'error',
});

module.exports = logger;
