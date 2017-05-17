const should = require('should');

let families = {
  'families': {
    '1': {
      'familyId': 2,
      'familyName': 'test',
      'familyCreatedAt': 'blubb',
      'familyModifiedAt': 'blubb2'
    }
  }
}

families.should.containDeep({
  'families': {
    '1': {
      'familyId': 1,
      'familyName': 'test',
    }
  }
});
