const should = require('should');
const plantJournal = require('../lib/pj');
const sqlite = require('sqlite');

describe('Generation()', function() {
  describe('#create()', function() {
    let pj;

    beforeEach(async function() {
      pj = new plantJournal(':memory:');
      await pj.connect();
      await pj.Family.create({familyName: 'testFamily1'});
      await pj.Generation.create({familyId: 1, generationName: 'F1'});
      await pj.Phenotype.create({generationId: 1, phenotypeName: 'testPhenotype1'});
    });

    it('should throw error if neither options.generationId nor options.phenotypeId is set', async function() {
      let catched = false;
      try {
        await pj.Plant.create({});
      } catch(err) {
        catched = true;
        err.message.should.eql('Either options.generationId or options.phenotypeId has to be set');
      }
      catched.should.be.true();
    });

    it('should throw error if options.generationId is not an integer', async function() {
      let catched = false;
      try {
        await pj.Plant.create({generationId: 'test'});
      } catch(err) {
        catched = true;
        err.message.should.eql('options.generationId has to be an integer');
      }
      catched.should.be.true();
    });

    it('should throw error if options.phenotypeId is not an integer', async function() {
      let catched = false;
      try {
        await pj.Plant.create({phenotypeId: null});
      } catch(err) {
        catched = true;
        err.message.should.eql('options.phenotypeId has to be an integer');
      }
      catched.should.be.true();
    });

    it('should throw error if options.phenotypeId is not set and options.generationId does not reference an existing generationId', async function() {
      let catched = false;
      try {
        await pj.Plant.create({generationId: 42});
      } catch(err) {
        catched = true;
        err.message.should.eql('options.generationId does not reference an existing Generation');
      }
      catched.should.be.true();
    });

    it('should throw error if options.plantName is not set', async function() {
      let catched = false;
      try {
        await pj.Plant.create({phenotypeId: 2});
      } catch(err) {
        catched = true;
        err.message.should.eql('options.plantName has to be set');
      }
      catched.should.be.true();
    });

    it('should throw error if options.phenotypeId does not reference an existing phenotypeId', async function() {
      let catched = false;
      try {
        await pj.Plant.create({phenotypeId: 2, plantName: 'test'});
      } catch(err) {
        catched = true;
        err.message.should.eql('options.phenotypeId does not reference an existing Phenotype');
      }
      catched.should.be.true();
    });

    afterEach(async function() {
      pj.disconnect();
    });
  });
});
