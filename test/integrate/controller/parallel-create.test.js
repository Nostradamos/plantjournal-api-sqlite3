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

  it(`should be possible to create 100 families at once without getting race conditions`, async () => {
    let all = [];
    for(let i=0;i<50;i++) {
      all.push(pj.Family.create({familyName: 'testFam'+i}));
    }
    console.log(all);
    await Promise.all(all);
  });

  it(`should be possible to create 100 generations and families at once without getting race conditions`, async () => {
    let all = [];
    for(let i=0;i<50;i++) {
      all.push(pj.Generation.create({familyName: 'testFam'+i, generationName: 'F'+i}));
    }
    console.log(all);
    await Promise.all(all);
  });

});
