const FamilyCreate = require('./family-create');

class GenerationCreate extends FamilyCreate {
  static validate() {
    console.log('generation');
    this.prototype.validate();
  }
}

if (require.main === module) {
  let gc = new GenerationCreate();
  let test = GenerationCreate.create({});
}
