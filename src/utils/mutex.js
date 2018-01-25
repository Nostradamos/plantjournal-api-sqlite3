'use strict';

const logger = require('../logger');

let mutexCounter = 1;

/**
 * Mutex implementation. Needed for exclusive locking of transactions.
 * Example:
 * let m = new Mutex();
 * async function a() {
 *   await m.lock();
 *   setTimeout(() => {console.log('a'); m.unlock();}, 1000);
 * }
 * async function b() {
 *   await m.lock();
 *   setTimeout(() => {console.log('b'); m.unlock();}, 500);
 * }
 * a();
 * b();
 */
class Mutex {
  /**
   * Creates a new mutex instance.
   */
  constructor() {
    this.locked = false;
    this.id = mutexCounter++;
    this.waitingResolvers = [];
  }

  /**
   * Tries to lock the mutex, and if it's already locked, asynchronously "waits"
   * until the mutex got unlocked.
   * @return {Promise}
   *   The Promise is resolved as soon as the Mutex is not unlocked, if it
   *   was locked on lock() call.
   */
  async lock() {
    if(!this.locked) return this._lock();

    // We are locked, return a promise and add a resolver callback to
    // this.waitingResolvers.
    logger.debug(`Mutex ${this.id} waiting till mutex gets unlocked`);
    return new Promise(resolve => {
      this.waitingResolvers.push(() => {
        this._lock();
        resolve();
      });
    });
  }

  /**
   * Internal method which does the logging. This method does not block if
   * Mutex is already locked.
   */
  _lock() {
    this.locked = true;
    logger.debug(`Mutex ${this.id} is now locked`);
  }

  /**
   * Unlocks mutex and gives the lock to the first resolver callback in queue,
   * if there's any.
   */
  unlock() {
    logger.debug(`Mutex ${this.id} is getting unlocked`);
    let resolver = this.waitingResolvers.pop();
    if(resolver) resolver();
    this.locked = false;
  }
}

module.exports = Mutex;
