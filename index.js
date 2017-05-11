import UrlPattern from 'url-pattern'
import assert from 'assert'

/*
 *  Router usage:
 *
 *  import RouterSingleton from './RouterSingleton'
 *
 *  const router = RouterSingleton.getRouter()
 *  router.addRoute('/', HomeView)
 *  router.addRoute('/about', AboutView)
 *  router.addRoute('/user/:id', UserView)
 *  router.setRoute('/')
 *  router.start('#app')
 *
 *  Views are supposed to be yo-yo functions
 *
 *  Anchor tags with a data-route property also trigger views, e.g.
 *  <a data-route="/">Home</a>
 *  <a data-route="/user/123">John Profile</a>
 */
class RouterSingleton {
  static getRouter (options) {
    if (typeof window.RouterInstance_ !== 'undefined') {
      return window.RouterInstance_
    }

    window.RouterInstance_ = new Router(options)

    return window.RouterInstance_
  }
}

class Router {
  constructor (options) {
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

    window.addEventListener('popstate', e => {
      this.onPopState(e)
    })

    let links = document.querySelectorAll('[data-route]')
    Array.prototype.forEach.call(links, link => {
      link.addEventListener('click', event => {
        event.preventDefault()
        link.setAttribute('data-bind', +new Date())
        this.goToPath(link.getAttribute('data-route'))
        if (typeof this.onNavClick === 'function') this.onNavClick(link.getAttribute('data-route'), link)
      })
    })
  }

  setStore (store) {
    this.store = store
  }

  addRoute (pattern, view, cb) {
    assert.equal(typeof pattern, 'string')
    assert.equal(typeof view, 'function')
    assert(typeof cb === 'undefined' || typeof cb === 'function')

    this.routes[pattern] = new Route(pattern, view, cb)
  }

  setRoot (path) {
    path = path || '/'
    this.root = this.getRoute(path)
    if (!this.root) {
      this.addRoute('/', () => document.createElement('div'))
      this.root = this.routes['/']
    }
  }

  start (selector) {
    assert(typeof selector === 'undefined' || typeof selector === 'string')
    assert(Object.keys(this.routes).length > 0)
    assert.notEqual(this.root, null)
    this.rootEl = document.querySelector(selector) || document.body
    this.requestStateUpdate()
  }

  onPopState (e) {
    if (e) e.preventDefault()
    this.requestStateUpdate(e)
  }

  getRoute (path) {
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

  notFound (notFoundView) {
    assert.equal(typeof notFoundView, 'function')
    this.default = new Route(null, notFoundView)
  }

  goToPath (path, title) {
    title = title || null
    // Only process real changes.
    if (path === window.location.pathname) {
      return
    }

    this.previousPath = window.location.pathname
    this.currentPath = path
    this.previousRoute = this.currentRoute || this.root
    this.currentRoute = this.getRoute(this.currentPath)
    // assert(this.currentRoute)

    window.history.pushState(undefined, title, path)
    window.requestAnimationFrame(() => {
      this.manageState()
    })
  }

  manageState () {
    var self = this
    if (this.currentPath === this.previousPath) return
    if (!this.currentRoute && this.default) this.currentRoute = this.default
    // currentView is the new view to be added
    const currentView = this.currentRoute.onStart(this.store)

    // if (!this.rootEl.hasChildNodes(currentView)) {
    if (this.firstRender && currentView) {
      this.firstRender = false
      this.rootEl.appendChild(currentView)
    } else if (!this.onRender || typeof this.onRender !== 'function') {
      const child = this.rootEl.lasttElementChild || this.rootEl.lastChild
      this.rootEl.replaceChild(currentView, child)
    } else {
      const child = this.rootEl.lasttElementChild || this.rootEl.lastChild
      this.onRender(currentView, child, this.currentRoute.cb)
    }
    var links = document.querySelectorAll('a[data-route]')
    Array.prototype.forEach.call(links, link => {
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

  requestStateUpdate (e) {
    this.previousPath = this.currentPath
    this.currentPath = window.location.pathname
    this.currentRoute = this.getRoute(e && e.target !== window
                                      ? e.target.getAttribute('data-route')
                                      : window.location.pathname)

    window.requestAnimationFrame(() => {
      this.manageState()
    })
  }
}

class Route {
  constructor (pattern, view, cb) {
    this.pattern = pattern
    this.cb = cb
    this._urlPattern = pattern ? new UrlPattern(pattern) : null
    this.view = view
    this.params = null
    this.path = null
  }

  getParams () {
    if (!this.path) return false
    return this.params
  }

  setParams () {
    if (!this.path) return false
    this.params = this._urlPattern ? this._urlPattern.match(this.path) : null
  }

  onStart (store) {
    this.path = window.location.pathname
    this.params = this._urlPattern ? this._urlPattern.match(this.path) : null
    return this.view(this.params, store)
  }
}

export default RouterSingleton.getRouter
