/* eslint-env node, mocha */
'use strict';

require('should');

const plantJournal = require('../../../src/pj');

describe(`Parallel`, () => {
  let pj;

  before(async () => {
    pj = new plantJournal(':memory:');
    await pj.connect();
  });

  after(async () => {
    await pj.disconnect();
  });

  it(`should be possible to create 50 families at once without getting race conditions`, async () => {
    await Promise.all(
      [
        pj.Family.create({familyName: 'testFam1'}),
        pj.Family.create({familyName: 'testFam2'}),
        pj.Family.create({familyName: 'testFam3'}),
        pj.Family.create({familyName: 'testFam4'}),
        pj.Family.create({familyName: 'testFam5'}),
        pj.Family.create({familyName: 'testFam6'}),
        pj.Family.create({familyName: 'testFam7'}),
        pj.Family.create({familyName: 'testFam8'}),
        pj.Family.create({familyName: 'testFam9'}),
        pj.Family.create({familyName: 'testFam10'}),
        pj.Family.create({familyName: 'testFam11'}),
        pj.Family.create({familyName: 'testFam12'}),
        pj.Family.create({familyName: 'testFam13'}),
        pj.Family.create({familyName: 'testFam14'}),
        pj.Family.create({familyName: 'testFam15'}),
        pj.Family.create({familyName: 'testFam16'}),
        pj.Family.create({familyName: 'testFam17'}),
        pj.Family.create({familyName: 'testFam18'}),
        pj.Family.create({familyName: 'testFam19'}),
        pj.Family.create({familyName: 'testFam20'}),
        pj.Family.create({familyName: 'testFam21'}),
        pj.Family.create({familyName: 'testFam22'}),
        pj.Family.create({familyName: 'testFam23'}),
        pj.Family.create({familyName: 'testFam24'}),
        pj.Family.create({familyName: 'testFam25'}),
        pj.Family.create({familyName: 'testFam26'}),
        pj.Family.create({familyName: 'testFam27'}),
        pj.Family.create({familyName: 'testFam28'}),
        pj.Family.create({familyName: 'testFam29'}),
        pj.Family.create({familyName: 'testFam30'}),
        pj.Family.create({familyName: 'testFam31'}),
        pj.Family.create({familyName: 'testFam32'}),
        pj.Family.create({familyName: 'testFam33'}),
        pj.Family.create({familyName: 'testFam34'}),
        pj.Family.create({familyName: 'testFam35'}),
        pj.Family.create({familyName: 'testFam36'}),
        pj.Family.create({familyName: 'testFam37'}),
        pj.Family.create({familyName: 'testFam38'}),
        pj.Family.create({familyName: 'testFam39'}),
        pj.Family.create({familyName: 'testFam40'}),
        pj.Family.create({familyName: 'testFam41'}),
        pj.Family.create({familyName: 'testFam42'}),
        pj.Family.create({familyName: 'testFam43'}),
        pj.Family.create({familyName: 'testFam44'}),
        pj.Family.create({familyName: 'testFam45'}),
        pj.Family.create({familyName: 'testFam46'}),
        pj.Family.create({familyName: 'testFam47'}),
        pj.Family.create({familyName: 'testFam48'}),
        pj.Family.create({familyName: 'testFam49'}),
        pj.Family.create({familyName: 'testFam50'})
      ]
    );
  });
});
