'use strict';

// This is more complicated that it needs to be since Handlebars is a
// synchronous compiler, but the plugin API mandates that a plugin's exported
// methods return promises. That's not a bad thing; it will allow for other
// templating engines, like Marko, that support streaming or asynchronous
// compilation.

let conf;
let log;

const fs = require('fs');
const path = require('path');
const Handlebars = require(path.join(__dirname, 'lib', 'handlebars'));
const gmf = require('get-module-file');

// loads a template file and runs it through Handlebars.compile
function templateLoader(tmplName) {
  function promise(resolve, reject) {
    try {
      const tmplBuf = fs.readFileSync(
        path.join(__dirname, 'templates', `${tmplName}.hbt`)
      );
      const tmpl = Handlebars.compile(tmplBuf.toString());
      return resolve(tmpl);
    } catch (e) {
      return reject(e);
    }
  }

  return new Promise(promise);
}

// wraps the template function returned by Handlebars.compile
function compile(context) {
  function promise(resolve, reject) {
    try {
      // jshint -W040
      const compiled = this(context);
      return resolve(compiled);
    } catch (e) {
      return reject(e);
    }
  }

  return new Promise(
    // jshint -W040
    promise.bind(this)
  );
}

const pages = {
  login: function(){},
  logout: function(){},
  loginRedirect: function(){},
  noService: function(){}
};

function loaderResolve(c) {
  // jshint -W040
  pages[this] = compile.bind(c);
}
function loaderCaught(e) {
  // jshint -W040
  pages[this] = Promise.reject.bind(e);
}
for (let t of Object.keys(pages)) {
  templateLoader(t)
    .then(loaderResolve.bind(t))
    .catch(loaderCaught.bind(t));
}

module.exports.name = 'defaultTheme';
module.exports.plugin = function plugin(options, context) {
  conf = options;
  log = context.logger;

  return pages;
};

module.exports.postInit = function postInit(context) {
  log.debug('theme postInit invoked');
  const server = context.server;
  server.register(require('inert'), (err) => {
    if (err) {
      log.error('could not load inert module');
      log.debug(err.message);
      return;
    }

    server.route({
      path: '/theme/concise.css',
      method: 'GET',
      handler: {
        file: {
          path: gmf.sync(__dirname, 'concise.css', '/dist/concise.css')
        }
      }
    });

    const routes = require('./routes');
    log.debug('theme routes: %j', routes);
    server.route(routes);
  });

  return Promise.resolve({});
};
