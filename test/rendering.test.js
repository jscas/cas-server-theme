'use strict'

const path = require('path')
const test = require('tap').test
const cheerio = require('cheerio')
const rimraf = require('rimraf')
const theme = require('../theme')

rimraf.sync(path.join(__dirname, '..', 'templates', '**', '*.marko.js'))

function noop () {}
const server = {
  route: noop,
  register: noop
}
const pages = theme.plugin({}, {logger: {
  debug: noop
}})

;(function * init () {
  yield theme.postInit({server})
}())

test('internalError page', (t) => {
  t.plan(1)
  pages
    .internalError({errorMessage: 'No error.'})
    .then((html) => {
      const $ = cheerio.load(html)
      t.match($('.text--error').text(), /No error\./)
    })
    .catch(t.threw)
})

test('login page', (t) => {
  t.plan(2)
  pages
    .login({
      service: 'http://example.com/test/service',
      errorMessage: 'No error. Just a test.'
    })
    .then((html) => {
      const $ = cheerio.load(html)
      t.match($('#main-content > p > strong').text(), /test\/service/)
      t.match($('.alert--error p:last-of-type').text(), /No error/)
    })
    .catch(t.threw)
})

test('loginRedirect page', (t) => {
  t.plan(3)
  pages
    .loginRedirect({
      service: 'http://example.com/test/service',
      ticket: 'service-ticket'
    })
    .then((html) => {
      const $ = cheerio.load(html)
      const a = $('a')
      t.match(a.attr('href'), /test\/service/)
      t.match(a.attr('href'), /service-ticket/)
      t.match(a.text(), /test\/service/)
    })
    .catch(t.threw)
})

test('logout page', (t) => {
  t.plan(1)
  pages
    .logout()
    .then((html) => {
      const $ = cheerio.load(html)
      t.match($('.text--success').text(), /logged out/)
    })
    .catch(t.threw)
})

test('noService page', (t) => {
  t.plan(1)
  pages
    .noService()
    .then((html) => {
      const $ = cheerio.load(html)
      t.match($('#main-content p:last-of-type').text(), /successfully/)
    })
    .catch(t.threw)
})

test('unauthorized page', (t) => {
  t.plan(1)
  pages
    .unauthorized()
    .then((html) => {
      const $ = cheerio.load(html)
      t.match($('#main-content p:last-of-type').text(), /Unauthorized/)
    })
    .catch(t.threw)
})
