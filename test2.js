const _ = require('lodash');

let str = '';
console.log( str == '' ? [] : _(str).split(',').map(_.toNumber).value());
