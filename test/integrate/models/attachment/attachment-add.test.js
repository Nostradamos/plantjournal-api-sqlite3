/* eslint-env node, mocha */
'use strict';

require('should');

const plantJournal = require('../../../../src/plant-journal');

describe(`Attachment()`, () => {

  describe(`#create()`, () => {
    let pj;

    beforeEach(async () => {
      pj = new plantJournal(':memory:');
      await pj.connect();
    });

    afterEach(async () => {
      await pj.disconnect();
    });

    it(`should throw 'First argument has to be an associative array' if first argument is not an object with properties/associative array`, async () => {
      let tested = 0;
      let toTest = [
        [1,2],
        null,
        'string',
        1,
        true,
        undefined
      ];

      for (let value in toTest) {
        await pj.Attachment.add(value)
          .should.be.rejectedWith(
            'First argument has to be an associative array');
        tested++;
      }
      tested.should.eql(6);
    });

    it(`should throw 'options.attachmentFilename has to be set' error if no options.attachmentFilename is provided`, async () => {
      await pj.Attachment.add({})
        .should.be.rejectedWith('options.attachmentFilename has to be set');
    });

    it(`should throw error if options.attachmentFilename is not a string`, async () => {
      await pj.Attachment.add({attachmentFilename: 1})
        .should.be.rejectedWith('options.attachmentFilename has to be a string');
    });

    it(`should create a new Attachment and return attachment object`, async () => {
      let attachment = await pj.Attachment.add({
        attachmentFilename: 'test234.png'});
      let [attachmentAddedAt, attachmentModifiedAt] = [
        attachment.attachments[1].attachmentAddedAt,
        attachment.attachments[1].attachmentModifiedAt
      ];

      attachmentAddedAt.should.eql(attachmentModifiedAt);
      attachment.should.deepEqual(
        {
          attachments: {
            1: {
              attachmentId: 1,
              attachmentFilename: 'test234.png',
              attachmentAddedAt: attachmentAddedAt,
              attachmentModifiedAt: attachmentModifiedAt
            }
          }
        }
      );

      let rows = await pj.knex.raw('SELECT * FROM attachments');
      attachment.attachments[1].should.containDeep(rows[0]);
    });
  });
});
