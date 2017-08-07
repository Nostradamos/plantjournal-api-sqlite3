const should = require('should');
const logger = require('../src/logger');
const winston = require('winston');

describe('logger()', function() {
    it('should just log.', function() {
        logger.log('silly', '127.0.0.1 - there\'s no place like home');
        logger.log('debug', '127.0.0.1 - there\'s no place like home');
        logger.log('verbose', '127.0.0.1 - there\'s no place like home');
        logger.log('info', '127.0.0.1 - there\'s no place like home');
        logger.log('warn', '127.0.0.1 - there\'s no place like home');
        logger.log('error', '127.0.0.1 - there\'s no place like home');
        logger.info('127.0.0.1 - there\'s no place like home');
        logger.warn('127.0.0.1 - there\'s no place like home');
        logger.error('127.0.0.1 - there\'s no place like home');
    });
});
