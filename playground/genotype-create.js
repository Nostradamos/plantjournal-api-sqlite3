const GenerationCreate = require('./generation-create');

class GenotypeCreate extends GenerationCreate {
  static validateOptions(context, options) {
    console.log('Validating options for Genotype', this.name);
  }
}

let test = GenotypeCreate.create({});
