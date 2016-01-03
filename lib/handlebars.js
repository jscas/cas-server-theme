'use strict';

const path = require('path');
const fs = require('fs');
const Handlebars = require('handlebars');
const partialPath = path.join(__dirname, '..', 'partials');

Handlebars.registerPartial(
  'header',
  fs.readFileSync(path.join(partialPath, 'header.hbt')).toString()
);

Handlebars.registerPartial(
  'footer',
  fs.readFileSync(path.join(partialPath, 'footer.hbt')).toString()
);

module.exports = Handlebars;
