/* eslint-env node, mocha */
'use strict';

require('should');

const plantJournal = require('../../src/pj');

describe(`plantJournal()`, () => {
  describe(`#constructor()`, () => {
    it(`should share database connection across every require of sqlite`, async () => {
      let pj = new plantJournal(':memory:');

      await pj.connect();
      let sqlite = require('sqlite');

      sqlite.driver.open.should.be.true();
      sqlite.driver.filename.should.equal(':memory:');
    });
  });
});
