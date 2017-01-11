import test from 'ava'
// for testing purpose import the unminified version
import SingletonRouter from './dist/bundle.js'
let router

window.requestAnimationFrame = function (fn) { setImmediate(fn) }
// window.location = {}

test.afterEach(t => {
  router = {}
})

test('Resolve static routes', async t => {
  t.plan(1)
  window.location.pathname = '/'
  // document.addEventListener('DOMContentLoaded', e => {
  router = SingletonRouter()
  router.addRoute('/', () => document.createElement('h1'), () => {
    t.truthy(document.querySelector('h1'))
  })
  router.setRoot('/')
  console.log(window.location.pathname)
  router.start()
  // })
})

// Resolve params in routes

// Manage history state

// Callbacks are fired afetr view is mounted

// Can set onRender and onNavClick functions

// When store is set, it will be pass over all the routes

// Custom root element

// Programmatically navigate
