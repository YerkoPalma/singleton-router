/* eslint-disable no-global-assign */
/* eslint-disable no-native-reassign */
/* eslint-disable no-unused-vars */

const test = require('tape')

global.window = require('./window')
global.document = require('./document')
const SingletonRouter = require('./index.es5.js')

test('singleton pattern', t => {
  t.plan(1)
  var router = SingletonRouter()
  router.something = {}
  var router_ = SingletonRouter()
  t.deepEqual(router, router_)
})

test('Router', t => {
  t.test('window should handle popstate', t => {
    t.plan(1)
    var router = SingletonRouter()
    var events = window.listeners('popstate')
    t.ok(events)
  })

  t.test('setStore should set the store property', t => {
    t.plan(2)
    var router = SingletonRouter()
    t.equal(router.store, null)
    var store = {}
    router.setStore(store)
    t.equal(router.store, store)
  })

  t.skip('addRoute')
})
