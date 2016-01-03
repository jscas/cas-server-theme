'use strict';

const fs = require('fs');
const path = require('path');

let routes = [];
for (let f of fs.readdirSync(__dirname)) {
  if (f === 'index.js') {
    continue;
  }

  routes = routes.concat(
    require(path.join(__dirname, f))
  );
}

module.exports = routes;
