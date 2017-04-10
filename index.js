'use strict';

const plantJournal = require('./lib/pj');

async function main() {
  var pj = new plantJournal(':memory:');
  await pj.connect();

  console.log(await pj.Family.create({
    familyName: 'Test'
  }));
}

main();
