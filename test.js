/* eslint-disable no-global-assign */
/* eslint-disable no-native-reassign */
/* eslint-disable no-unused-vars */

var test = require('tape')
var assert = require('assert')

global.window = require('./window')
global.document = require('./document')
var SingletonRouter = require('./')
var sinon = require('sinon')
var router = null

test = beforeEach(test, function (t) {
  // called before each thing
  window.RouterInstance = undefined
  router = undefined
  router = SingletonRouter()

  // when done call
  t.end()
})

test('singleton pattern', function (t) {
  t.plan(1)

  router.something = {}
  var router_ = SingletonRouter()
  t.deepEqual(router, router_)
})

test('Router', function (t) {
  t.test('window should handle popstate', function (t) {
    t.plan(1)

    var events = window.listeners('popstate')
    t.ok(events)
  })

  t.test('setStore should set the store property', function (t) {
    t.plan(2)

    t.equal(router.store, null)
    var store = {}
    router.setStore(store)
    t.equal(router.store, store)
  })

  t.test('addRoute', function (t) {
    t.plan(3)

    var routes = Object.keys(router.routes)
    t.equal(routes.length, 0)
    router.addRoute('/r', function () {})
    routes = Object.keys(router.routes)
    t.equal(routes.length, 1)
    t.ok(router.routes['/r'])
  })

  t.test('addRoute validations', function (t) {
    t.plan(6)

    // add Route should require pattern and view
    t.throws(function () { router.addRoute() })
    t.throws(function () { router.addRoute(null, null) })
    // pattern must be a string and view a function
    t.throws(function () { router.addRoute({}, {}) })
    t.doesNotThrow(function () { router.addRoute('', function () {}) })
    // if callback is present, it must be a function
    t.throws(function () { router.addRoute('', function () {}, '') })
    t.doesNotThrow(function () { router.addRoute('', function () {}, function () {}) })
  })

  t.test('setRoot validations', function (t) {
    t.plan(3)

    // path undefined or string
    router.addRoute('/', function () {})
    t.throws(function () { router.setRoot(null) })
    t.throws(function () { router.setRoot({}) })
    // if string path inserted, must be a valid route
    t.throws(function () { router.setRoot('/fake') })
  })
})

test('setRoot', function (t) {
  t.plan(5)

  router.addRoute('/root', function () {})
  // with a string, search for a route with that path, otherwiese throw
  t.doesNotThrow(function () { router.setRoot('/root') })
  t.equal(router.root, router.routes['/root'])
  // with undefined, creates a route on path '/'
  t.doesNotThrow(function () { router.setRoot() })
  var routes = Object.keys(router.routes)
  t.equal(routes.length, 2)
  t.equal(router.root, router.routes['/'])
})

test('start', function (t) {
  t.plan(3)

  router.addRoute('/', function () {})
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

test('start validations', function (t) {
  t.plan(4)
  router.requestStateUpdate = sinon.spy()
  // there must be at least one route defined
  // root route must be set
  t.throws(function () { router.start() })
  router.addRoute('/', function () {})
  router.setRoot('/')
  t.doesNotThrow(function () { router.start() })
  // selector must be undefined or a string
  t.throws(function () { router.start(null) })
  t.throws(function () { router.start({}) })
})

test('onPopState', function (t) {
  t.plan(1)
  router.requestStateUpdate = sinon.spy()
  router.onPopState()
  // window.emit('popstate', { preventDefault: () => {} })
  t.equal(router.requestStateUpdate.callCount, 1)
})

test('getRoute', function (t) {
  t.plan(6)
  // path must always be a string
  t.throws(function () { router.getRoute() })
  t.throws(function () { router.getRoute(null) })
  t.throws(function () { router.getRoute({}) })
  // if there is no route in router, getRoute always return null
  t.equal(router.getRoute(''), null)
  t.equal(router.getRoute('/'), null)
  // if there is any route, return the best match
  router.addRoute('/', function () { t.fail() })
  router.addRoute('/post', function () { t.pass() })
  router.addRoute('/post/:id', function () { t.fail() })
  var route = router.getRoute('/post')
  route.view()
})

test('notFound', function (t) {
  t.plan(7)
  // notFoundView should be a function
  t.throws(function () { router.notFound() })
  t.throws(function () { router.notFound(null) })
  t.throws(function () { router.notFound({}) })
  t.throws(function () { router.notFound('') })
  // this.default should be defined
  t.equal(router.default, null)
  router.notFound(function () {})
  t.notEqual(router.defualt, null)
  // should not add anything to the routes object
  t.equal(Object.keys(router.routes).length, 0)
})

test('goToPath', function (t) {
  t.plan(7)
  // for the same path don't do anything
  t.equal(router.currentPath, null)
  window.location.pathname = '/'
  router.goToPath('/')
  t.equal(router.currentPath, null)
  // should throw if there is no route match
  // t.throws(() => { router.goToPath('/route') }, assert.AssertionError)
  // should call manage state
  router.manageState = sinon.spy()
  router.addRoute('/', function () {})
  router.addRoute('/route', function () {})
  router.setRoot('/')
  router.goToPath('/route')
  t.equal(router.manageState.callCount, 1)
  // should update currentPath
  t.equal(router.currentPath, '/route')
  // should update previousPath
  t.equal(router.previousPath, '/')
  // should update previousRoute
  t.equal(router.previousRoute, router.getRoute('/'))
  // should update currentRoute
  t.equal(router.currentRoute, router.getRoute('/route'))
})

test('manageState', function (t) {
  t.plan(3)
  // should do nothing when is the same path
  router.addRoute('/foo', function () {})
  router.addRoute('/bar', function () {})
  router.notFound(function () { return true })
  router.setRoot('/foo')
  router.start()
  var preRouter = router
  router.manageState()
  t.equal(preRouter, router)
  router.previousPath = '/foo'
  router.currentPath = '/bar'
  router.manageState()
  // when there is no currentRoute, set to default if present
  t.ok(router.rootEl.appendChild.calledWith(router.default.view()))
  // if rootEl has no childs, append view
  t.ok(router.rootEl.appendChild.calledOnce)
  // if rootEl has childs, replace with view
  // if router define custom render function, call that
  // currentRoute should call cb if defined
})

test('request state update', function (t) {
  t.plan(3)

  router.manageState = sinon.spy()
  router.addRoute('/foo', function () {})
  router.addRoute('/', function () {})
  router.setRoot('/')
  router.start()
  window.location.pathname = '/foo'
  router.currentPath = '/'
  router.requestStateUpdate()
  t.equal(router.previousPath, '/')
  t.equal(router.currentPath, '/foo')
  t.ok(router.manageState.calledTwice)
})

test('onRender', function (t) {
  t.plan(2)

  var onRender = function (previous, current, _cb) {
    cb()
    t.pass()
  }
  var cb = function () { t.pass() }
  window.RouterInstance = undefined
  router = undefined
  router = SingletonRouter({ onRender: onRender })

  router.addRoute('/foo', function () {}, cb)
  router.addRoute('/', function () {})
  router.setRoot('/')
  router.start()
  router.goToPath('/foo')
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
