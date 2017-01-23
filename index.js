import UrlPattern from 'url-pattern'

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
    this.rootEl = null
    this.store = null
    this.default = null
    this.onRender = options && options.onRender ? options.onRender : null
    this.onNavClick = options && options.onNavClick ? options.onNavClick : null

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
    this.routes[pattern] = new Route(pattern, view, cb)
  }

  setRoot (path) {
    this.root = this.getRoute(path) || new Route('/', () => document.createElement('div'))
  }

  start (selector) {
    this.rootEl = document.querySelector(selector) || document.body
    this.requestStateUpdate()
  }

  onPopState (e) {
    e.preventDefault()
    this.requestStateUpdate(e)
  }

  getRoute (path) {
    for (var pattern in this.routes) {
      if (this.routes.hasOwnProperty(pattern)) {
        if (this.routes[pattern]._urlPattern.match(path) !== null) return this.routes[pattern]
      }
    }
  }

  notFound (notFoundView) {
    this.default = new Route(null, notFoundView)
  }

  goToPath (path, title = null) {
    this.previousPath = window.location.pathname
    // Only process real changes.
    if (path === window.location.pathname) {
      return
    }

    this.currentPath = path
    this.previousRoute = this.currentRoute || this.root
    this.currentRoute = this.getRoute(this.currentPath)

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

    if (!this.rootEl.hasChildNodes(currentView)) {
      this.rootEl.appendChild(currentView)
    } else if (!this.onRender || typeof this.onRender !== 'function') {
      const child = this.rootEl.firstChild
      this.rootEl.replaceChild(currentView, child)
    } else {
      const child = this.rootEl.firstChild
      this.onRender(currentView, child)
    }
    var links = document.querySelectorAll('a[data-route]')
    Array.prototype.forEach.call(links, link => {
      link.addEventListener('click', function (e) {
        e.preventDefault()
        if (!link.getAttribute('data-bind')) self.goToPath(link.getAttribute('data-route'))
        if (typeof self.onNavClick === 'function') self.onNavClick(link.getAttribute('data-route'), link)
      })
    })
    if (typeof this.currentRoute.cb === 'function') {
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
