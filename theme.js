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

const templatesPath = path.join(__dirname, 'templates');
const viewsPath = path.join(templatesPath, 'views');

const defaultLayout = (function() {
  const layoutBuf = fs.readFileSync(
    path.join(templatesPath, 'layouts', 'default.hbt')
  );
  return Handlebars.compile(layoutBuf.toString());
}());

// loads a template file and runs it through Handlebars.compile
function templateLoader(tmplName) {
  function promise(resolve, reject) {
    try {
      const tmplBuf = fs.readFileSync(
        path.join(viewsPath, `${tmplName}.hbt`)
      );
      const tmpl = Handlebars.compile(tmplBuf.toString());
      return resolve(tmpl);
    } catch (e) {
      return reject(e);
    }
  }

  return new Promise(promise);
}

const pages = {
  internalError: function(){},
  login: function(){},
  loginRedirect: function(){},
  logout: function(){},
  noService: function(){},
  unauthorized: function(){},
};

function loaderResolve(compiler) {
  // jshint -W040
  pages[this] = function(context) {
    const _context = {};
    _context.mainContent = compiler(context);

    let compiled;
    try {
      compiled = defaultLayout(_context);
    } catch (e) {
      return Promise.reject(e);
    }

    return Promise.resolve(compiled);
  };
}
function loaderCaught(error) {
  // jshint -W040
  pages[this] = Promise.reject.bind(error);
}
for (let page of Object.keys(pages)) {
  templateLoader(page)
    .then(loaderResolve.bind(page))
    .catch(loaderCaught.bind(page));
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

    const routes = require(path.join(__dirname, 'routes'));
    log.debug('theme routes: %j', routes);
    server.route(routes);
  });

  return Promise.resolve({});
};
