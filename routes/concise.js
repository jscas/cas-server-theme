'use strict';

//const path = require('path');
const gmf = require('get-module-file');

const route = {
  path: '/theme/concise.css',
  method: 'GET',
  handler: {
    file: {
      path: gmf.sync(__dirname, 'concise.css', '/dist/concise.css')
    }
  }
};

module.exports = [route];
