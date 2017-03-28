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

  t.test('addRoute', t => {
    t.plan(3)

    var router = SingletonRouter()
    var routes = Object.keys(router.routes)
    t.equal(routes.length, 0)
    router.addRoute('/r', () => {})
    routes = Object.keys(router.routes)
    t.equal(routes.length, 1)
    t.ok(router.routes['/r'])
  })

  t.test('addRoute validations', t => {
    t.plan(6)

    var router = SingletonRouter()
    // add Route should require pattern and view
    t.throws(() => { router.addRoute() })
    t.throws(() => { router.addRoute(null, null) })
    // pattern must be a string and view a function
    t.throws(() => { router.addRoute({}, {}) })
    t.doesNotThrow(() => { router.addRoute('', () => {}) })
    // if callback is present, it must be a function
    t.throws(() => { router.addRoute('', () => {}, '') })
    t.doesNotThrow(() => { router.addRoute('', () => {}, () => {}) })
  })

  t.test('setRoot validations', t => {
    t.plan(3)

    // path undefined or string
    var router = SingletonRouter()
    router.addRoute('/', () => {})
    t.throws(() => { router.setRoot(null) })
    t.throws(() => { router.setRoot({}) })
    // if string path inserted, must be a valid route
    t.throws(() => { router.setRoot('/fake') })
  })

  t.test('setRoot', t => {
    t.plan(5)

    var router = SingletonRouter()
    router.addRoute('/root', () => {})
    console.log(router.routes)
    // with a string, search for a route with that path, otherwiese throw
    t.doesNotThrow(() => { router.setRoot('/root') })
    t.equal(router.root, router.routes['/root'])
    // with undefined, creates a route on path '/'
    t.doesNotThrow(() => { router.setRoot() })
    var routes = Object.keys(router.routes)
    t.equal(routes.length, 2)
    t.equal(router.root, router.routes['/root'])
  })
})
