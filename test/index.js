'use strict';

const path = require('path');
const cheerio = require('cheerio');
const rimraf = require('rimraf');
const expect = require('chai').expect;
const theme = require(path.join(__dirname, '..', 'theme.js'));

rimraf.sync(path.join(__dirname, '..', 'templates' , '**', '*.marko.js'));

function noop() {}
const server = {
  route: noop,
  register: noop
};
const pages = theme.plugin({}, {logger: {
  debug: noop
}});

(function* init() {
  yield theme.postInit({server});
}());

suite('template rendering');

test('internalError page', function ie(done) {
  pages
    .internalError({errorMessage: 'No error.'})
    .then((html) => {
      const $ = cheerio.load(html);
      expect($('.text--error').text()).to.contain('No error.');
      done();
    })
    .catch(done);
});

test('login page', function lp(done) {
  pages
    .login({
      service: 'http://example.com/test/service',
      errorMessage: 'No error. Just a test.',
      lt: 'login-ticket'
    })
    .then((html) => {
      const $ = cheerio.load(html);
      expect($('#main-content > p > strong').text()).to.contain('test/service');
      expect($('[name=lt]').attr('value')).to.equal('login-ticket');
      expect($('.alert--error p:last-of-type').text()).to.contain('No error');
      done();
    })
    .catch(done);
});

test('loginRedirect page', function lrp(done) {
  pages
    .loginRedirect({
      service: 'http://example.com/test/service',
      ticket: 'service-ticket'
    })
    .then((html) => {
      const $ = cheerio.load(html);
      const a = $('a');
      expect(a.attr('href')).to.contain('test/service');
      expect(a.attr('href')).to.contain('service-ticket');
      expect(a.text()).to.contain('test/service');
      done();
    })
    .catch(done);
});

test('logout page', function lop(done) {
  pages
    .logout()
    .then((html) => {
      const $ = cheerio.load(html);
      expect($('.text--success').text()).to.contain('logged out');
      done();
    })
    .catch(done);
});

test('noService page', function nsp(done) {
  pages
    .noService()
    .then((html) => {
      const $ = cheerio.load(html);
      expect($('#main-content p:last-of-type').text())
        .to.contain('successfully');
      done();
    })
    .catch(done);
});

test('unauthorized page', function up(done) {
  pages
    .unauthorized()
    .then((html) => {
      const $ = cheerio.load(html);
      expect($('#main-content p:last-of-type').text())
        .to.contain('Unauthorized');
      done();
    })
    .catch(done);
});
