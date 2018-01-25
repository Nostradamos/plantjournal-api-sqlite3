'use strict';

const EventEmitter = require('events');

const logger = require('../logger');

let mutexCounter = 1;

class Mutex extends EventEmitter {
  constructor() {
    super();
    this.locked = false;
    this.id = mutexCounter++;
    this.waitingResolvers = []
  }

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

  _lock() {
    this.locked = true;
    logger.debug(`Mutex ${this.id} is now locked`);
  }

  unlock() {
    logger.debug(`Mutex ${this.id} is getting unlocked`);
    let resolver = this.waitingResolvers.pop();
    if(resolver) resolver();
    this.locked = false;
  }
}

module.exports = Mutex;
