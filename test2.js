const plantJournal = require('./lib/pj');

async function main() {
  pj = new plantJournal('./test.sql');
  await pj.connect();
  await pj.Family.create({familyName: 'testFamily1'});
  await pj.Family.create({familyName: 'testFamily2'});
  await pj.Generation.create({familyId: 1, generationName: 'F1'});
  await pj.Generation.create({familyId: 1, generationName: 'F2'});
  await pj.Generation.create({familyId: 2, generationName: 'S1'});
  await pj.Plant.create({generationId: 1, plantName: 'testPlant1'});
  await pj.Plant.create({generationId: 1, plantName: 'testPlant2'});
  await pj.Generation.create({familyId: 2, generationName: 'S2', generationParents: [1,2]});
  await pj.disconnect();
}

main();
