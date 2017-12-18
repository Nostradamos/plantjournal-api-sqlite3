/* eslint-env node, mocha */
'use strict';

require('should');

require('./utils-test');

describe(`HelperFunctions`, () => {
  describe(`Assertion: sqlEql`, () => {
    it(`should add new Assertion to should which makes sure both sql strings are identically besides the newlines/whitespaces`, () => {
      `SELECT * FROM TEST
       WHERE foo = 'bar'
       LIMIT 1`.should.sqlEql('SELECT * FROM TEST WHERE foo = \'bar\' LIMIT 1');
    });

    it(`should fail if sql strings aren't equl`, () => {
      `SELECT * FROM asd
       WHERE foo = 'bar'
       LIMIT 1`.should.not.sqlEql('SELECT * FROM TEST WHERE foo = \'bar\' LIMIT 1');
    });
  });
});
