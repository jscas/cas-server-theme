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
const marko = require('marko');

const markoCompiler = require('marko/compiler');
markoCompiler.defaultOptions.writeToDisk = false;
markoCompiler.defaultOptions.checkUpToDate = true;

const templatesPath = path.join(__dirname, 'templates');
const pages = {
  internalError: function(){},
  login: function(){},
  loginRedirect: function(){},
  logout: function(){},
  noService: function(){},
  unauthorized: function(){}
};

module.exports.name = 'defaultTheme';
module.exports.plugin = function plugin(options, context) {
  conf = options;
  log = context.logger;

  try {
    const layout =
      marko.load(path.join(templatesPath, 'layouts', 'default.marko'));

    for (let p of Object.keys(pages)) {
      pages[p] = function pageRenderer(context) {
        log.debug('rendering %s page: %j', p, context);
        const _context = {
          mainContent: pages[p].template
        };
        try {
          const result = layout.renderSync(Object.assign({}, _context, context));
          log.debug('rendering complete');
          return Promise.resolve(result);
        } catch (e) {
          log.debug('rendering failed: %j', e);
          return Promise.reject(e);
        }
      };

      pages[p].template =
        marko.load(path.join(templatesPath, 'views', `${p}.marko`));
    }
  } catch (e) {
    return Promise.reject(e);
  }

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
