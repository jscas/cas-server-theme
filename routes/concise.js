'use strict'

const path = require('path')

const route = {
  path: '/theme/concise.css',
  method: 'GET',
  handler: {
    file: {
      path: path.resolve(path.join(
        __dirname, '..', 'node_modules', 'concise.css', 'dist', 'concise.css'
      ))
    }
  }
}

module.exports = [route]
