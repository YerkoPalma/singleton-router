/* eslint-disable no-global-assign */
/* eslint-disable no-native-reassign */
/* eslint-disable no-unused-vars */

var test = require('tape')

global.window = require('./window')
global.document = require('./document')
const SingletonRouter = require('./index.es5.js')
const sinon = require('sinon')
var router = null

test = beforeEach(test, t => {
  // called before each thing
  console.log('reseting router')
  window.RouterInstance_ = undefined
  router = undefined
  router = SingletonRouter()

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
  // with a string, search for a route with that path, otherwiese throw
  t.doesNotThrow(() => { router.setRoot('/root') })
  t.equal(router.root, router.routes['/root'])
  // with undefined, creates a route on path '/'
  t.doesNotThrow(() => { router.setRoot() })
  var routes = Object.keys(router.routes)
  t.equal(routes.length, 2)
  t.equal(router.root, router.routes['/'])
})

test('start', t => {
  t.plan(3)

  router.addRoute('/', () => {})
  router.setRoot('/')
  router.requestStateUpdate = sinon.spy()
  // without selector
  router.start()
  t.equal(router.rootEl, document.body)
  // with selector
  router.start('#app')
  t.equal(router.rootEl, document.querySelector('#app'))
  // should call requestStateUpdate
  t.equal(router.requestStateUpdate.callCount, 2)
})

test('start validations', t => {
  t.plan(4)
  router.requestStateUpdate = sinon.spy()
  // there must be at least one route defined
  // root route must be set
  t.throws(() => { router.start() })
  router.addRoute('/', () => {})
  router.setRoot('/')
  t.doesNotThrow(() => { router.start() })
  // selector must be undefined or a string
  t.throws(() => { router.start(null) })
  t.throws(() => { router.start({}) })
})

test('onPopState', t => {
  t.plan(1)
  router.requestStateUpdate = sinon.spy()
  router.onPopState()
  // window.emit('popstate', { preventDefault: () => {} })
  t.equal(router.requestStateUpdate.callCount, 1)
})

test('getRoute', t => {
  t.plan(6)
  // path must always be a string
  t.throws(() => { router.getRoute() })
  t.throws(() => { router.getRoute(null) })
  t.throws(() => { router.getRoute({}) })
  // if there is no route in router, getRoute always return null
  t.equal(router.getRoute(''), null)
  t.equal(router.getRoute('/'), null)
  // if there is any route, return the best match
  router.addRoute('/', () => { t.fail() })
  router.addRoute('/post', () => { t.pass() })
  router.addRoute('/post/:id', () => { t.fail() })
  var route = router.getRoute('/post')
  route.view()
})

test('notFound', t => {
  t.plan(7)
  // notFoundView should be a function
  t.throws(() => { router.notFound() })
  t.throws(() => { router.notFound(null) })
  t.throws(() => { router.notFound({}) })
  t.throws(() => { router.notFound('') })
  // this.default should be defined
  t.equal(router.default, null)
  router.notFound(() => {})
  t.notEqual(router.defualt, null)
  // should not add anything to the routes object
  t.equal(Object.keys(router.routes).length, 0)
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
