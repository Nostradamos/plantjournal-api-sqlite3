const should = require('should');
const plantJournal = require('./lib/pj');
const _ = require('lodash');

console.log("hallo");

async function main() {
  let pj = new plantJournal(':memory:');
  await pj.connect();

  let tested = 0;
  console.log('hallo1');
  for(value in [[1,2], null, 'string', 1, true, undefined]) {
    await pj.Family.create({familyName: 'test'+value});
    tested++;
  }
  console.log('hallo2');
  tested.should.eql(6);
}

main();
