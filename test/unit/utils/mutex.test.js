/* eslint-env node, mocha */
'use strict';

require('should');

const Mutex = require('../../../src/utils/mutex');

function sleep (timeout) {
  return new Promise((resolve) => {
    // wait 3s before calling fn(par)
    setTimeout(() => resolve(), timeout)
  })
}

describe(`Mutex`, () => {
  describe(`single testing`, () => {
    it(`should block await m.lock() until lock gets released/unlocked`, async () => {
      let m = new Mutex();
      let a = false;
      let b = false;
      async function lockTest1() {
        console.log('starting a');
        await m.lock();
        await sleep(50);
        a = true;
        console.log('a done');
        m.unlock();
      }
      async function lockTest2() {
        console.log('starting b');
        await m.lock();
        await sleep(50);
        b = true;
        console.log('b done');
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
      async function lockTest(i) {
        await m.lock();
        setTimeout(() => {
          console.log(i);
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
