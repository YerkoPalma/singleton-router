var UrlPattern = require('url-pattern')
var assert = require('assert')

function getRouter (options) {
  if (typeof window.RouterInstance !== 'undefined') {
    return window.RouterInstance
  }

  window.RouterInstance = new Router(options)

  return window.RouterInstance
}

function Router (options) {
  this.routes = {}
  this.currentPath = null
  this.previousPath = null
  this.currentRoute = null
  this.previousRoute = null
  this.root = null
  this.firstRender = true
  this.rootEl = null
  this.store = null
  this.default = null
  this._debug = false
  this.onRender = options && options.onRender ? options.onRender : null
  this.onNavClick = options && options.onNavClick ? options.onNavClick : null
  this.prefix = options && options.prefix ? options.prefix : ''
  var self = this

  window.addEventListener('popstate', function (e) {
    self.onPopState(e)
  })

  var links = document.querySelectorAll('[data-route]')
  Array.prototype.forEach.call(links, function (link) {
    link.addEventListener('click', function (event) {
      event.preventDefault()
      link.setAttribute('data-bind', +new Date())
      this.goToPath(link.getAttribute('data-route'))
      if (typeof this.onNavClick === 'function') this.onNavClick(link.getAttribute('data-route'), link)
    })
  })
}

Router.prototype.setStore = function setStore (store) {
  this.store = store
}

Router.prototype.addRoute = function addRoute (pattern, view, cb) {
  assert.equal(typeof pattern, 'string')
  assert.equal(typeof view, 'function')
  assert(typeof cb === 'undefined' || typeof cb === 'function')

  this.routes[pattern] = new Route(pattern, view, cb)
}

Router.prototype.setRoot = function setRoot (path) {
  path = path || '/'
  this.root = this.getRoute(path)
  if (!this.root) {
    this.addRoute('/', function () { return document.createElement('div') })
    this.root = this.routes['/']
  }
}

Router.prototype.start = function start (selector) {
  assert(typeof selector === 'undefined' || typeof selector === 'string')
  assert(Object.keys(this.routes).length > 0)
  assert.notEqual(this.root, null)
  this.rootEl = document.querySelector(selector) || document.body
  this.requestStateUpdate()
}

Router.prototype.onPopState = function onPopState (e) {
  if (e) e.preventDefault()
  this.requestStateUpdate(e)
}

Router.prototype.getRoute = function getRoute (path) {
  assert.equal(typeof path, 'string')
  var posibleRoutes = []
  for (var pattern in this.routes) {
    if (this.routes.hasOwnProperty(pattern)) {
      if (this.routes[pattern]._urlPattern.match(path) !== null) posibleRoutes.push(this.routes[pattern])
    }
  }
  if (posibleRoutes.length === 1) return posibleRoutes[0]
  // there are more than one candidate
  if (posibleRoutes.length === 0) return null
}

Router.prototype.notFound = function notFound (notFoundView) {
  assert.equal(typeof notFoundView, 'function')
  this.default = new Route(null, notFoundView)
}

Router.prototype.goToPath = function goToPath (path, title) {
  title = title || null
  // Only process real changes.
  if (path === window.location.pathname) {
    return
  }
  var self = this
  this.previousPath = window.location.pathname
  this.currentPath = path
  this.previousRoute = this.currentRoute || this.root
  this.currentRoute = this.getRoute(this.currentPath)
  // assert(this.currentRoute)

  window.history.pushState(undefined, title, path)
  window.requestAnimationFrame(function () {
    self.manageState()
  })
}

Router.prototype.manageState = function manageState () {
  var self = this
  if (this.currentPath === this.previousPath) return
  if (!this.currentRoute && this.default) this.currentRoute = this.default
  // currentView is the new view to be added
  var currentView = this.currentRoute.onStart(this.store)
  var child = null

  // if (!this.rootEl.hasChildNodes(currentView)) {
  if (this.firstRender && currentView) {
    this.firstRender = false
    this.rootEl.appendChild(currentView)
  } else if (!this.onRender || typeof this.onRender !== 'function') {
    child = this.rootEl.lasttElementChild || this.rootEl.lastChild
    this.rootEl.replaceChild(currentView, child)
  } else {
    child = this.rootEl.lasttElementChild || this.rootEl.lastChild
    this.onRender(currentView, child, this.currentRoute.cb)
  }
  var links = document.querySelectorAll('a[data-route]')
  Array.prototype.forEach.call(links, function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault()
      if (!link.getAttribute('data-bind')) self.goToPath(link.getAttribute('data-route'))
      if (typeof self.onNavClick === 'function') self.onNavClick(link.getAttribute('data-route'), link)
    })
  })
  if ((!this.onRender || typeof this.onRender !== 'function') && typeof this.currentRoute.cb === 'function') {
    try {
      this.currentRoute.cb()
    } catch (ex) {
      console.error(ex)
    }
  }
}

Router.prototype.requestStateUpdate = function requestStateUpdate (e) {
  this.previousPath = this.currentPath
  this.currentPath = window.location.pathname
  this.currentRoute = this.getRoute(e && e.target !== window
                                    ? e.target.getAttribute('data-route')
                                    : window.location.pathname)
  var self = this
  window.requestAnimationFrame(function () {
    self.manageState()
  })
}

function Route (pattern, view, cb) {
  this.pattern = pattern
  this.cb = cb
  this._urlPattern = pattern ? new UrlPattern(pattern) : null
  this.view = view
  this.params = null
  this.path = null
}

Route.prototype.getParams = function getParams () {
  if (!this.path) return false
  return this.params
}
Route.prototype.setParams = function setParams () {
  if (!this.path) return false
  this.params = this._urlPattern ? this._urlPattern.match(this.path) : null
}

Route.prototype.onStart = function onStart (store) {
  this.path = window.location.pathname
  this.params = this._urlPattern ? this._urlPattern.match(this.path) : null
  return this.view(this.params, store)
}

module.exports = getRouter
