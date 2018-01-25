/* eslint-env node, mocha */
'use strict';

require('should');

const Mutex = require('../../../src/utils/mutex');
const logger = require('../../../src/logger');

/**
 * Awaitable sleep function.
 * Example:
 * async () => { await sleep(3000); console.log('test')}
 * @param  {[type]} timeout [description]
 * @return {[type]}         [description]
 */
function sleep (timeout) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), timeout);
  });
}

describe(`Mutex`, () => {
  describe(`single testing`, () => {
    it(`should block await m.lock() until lock gets released/unlocked`, async () => {
      let m = new Mutex();
      let a = false;
      let b = false;
      async function lockTest1() { // eslint-disable-line require-jsdoc
        logger.debug('starting a');
        await m.lock();
        await sleep(50);
        a = true;
        logger.debug('a done');
        m.unlock();
      }
      async function lockTest2() { // eslint-disable-line require-jsdoc
        logger.debug('starting b');
        await m.lock();
        await sleep(50);
        b = true;
        logger.debug('b done');
        m.unlock();
      }
      await Promise.all([lockTest1(), lockTest2()]);
      a.should.be.true();
      b.should.be.true();
    });
  });

  describe(`mass testing`, () => {
    it(`should be able to have 500 async methods waiting for the lock`, async () => {
      let m = new Mutex();
      async function lockTest(i) { // eslint-disable-line require-jsdoc
        await m.lock();
        setTimeout(() => {
          logger.debug(i);
          m.unlock();
        }, 10);
      }

      let all = [];
      for(let c=0;c<10;c++) {
        all.push(lockTest(c));
      }
      await Promise.all(all);
    }).timeout(501*50);
  });
});
