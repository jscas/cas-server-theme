'use strict';

const path = require('path');
const resources = path.resolve(path.join(__dirname, '..', 'resources'));

const route = {
  method: 'GET',
  path: '/theme/resources/{param*}',
  handler: {
    directory: {
      path: resources
    }
  }
};

module.exports = [route];
