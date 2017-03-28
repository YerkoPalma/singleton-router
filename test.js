/* eslint-disable no-global-assign */
/* eslint-disable no-native-reassign */
/* eslint-disable no-unused-vars */

var test = require('tape')

global.window = require('./window')
global.document = require('./document')
const SingletonRouter = require('./index.es5.js')
var router = null

test = beforeEach(test, t => {
  // called before each thing
  console.log('reseting router')
  router = SingletonRouter()

  // when done call
  t.end()
})
test = afterEach(test, t => {
  // called after each thing
  console.log('clearing router')
  window.RouterInstance_ = undefined
  router = undefined

  // when done call
  t.end()
})

test('singleton pattern', t => {
  t.plan(1)

  router.something = {}
  var router_ = SingletonRouter()
  t.deepEqual(router, router_)
})

test('Router', t => {
  t.test('window should handle popstate', t => {
    t.plan(1)

    var events = window.listeners('popstate')
    t.ok(events)
  })

  t.test('setStore should set the store property', t => {
    t.plan(2)

    t.equal(router.store, null)
    var store = {}
    router.setStore(store)
    t.equal(router.store, store)
  })

  t.test('addRoute', t => {
    t.plan(3)

    var routes = Object.keys(router.routes)
    t.equal(routes.length, 0)
    router.addRoute('/r', () => {})
    routes = Object.keys(router.routes)
    t.equal(routes.length, 1)
    t.ok(router.routes['/r'])
  })

  t.test('addRoute validations', t => {
    t.plan(6)

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
    router.addRoute('/', () => {})
    t.throws(() => { router.setRoot(null) })
    t.throws(() => { router.setRoot({}) })
    // if string path inserted, must be a valid route
    t.throws(() => { router.setRoot('/fake') })
  })
})

test('setRoot', t => {
  t.plan(5)

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

function beforeEach (test, handler) {
  return function tapish (name, listener) {
    test(name, function (assert) {
      var _end = assert.end
      assert.end = function () {
        assert.end = _end
        listener(assert)
      }

      handler(assert)
    })
  }
}
function afterEach (test, handler) {
  return function tapish (name, listener) {
    test(name, function (assert) {
      var _end = assert.end
      assert.end = function () {
        assert.end = _end
        handler(assert)
      }

      listener(assert)
    })
  }
}
