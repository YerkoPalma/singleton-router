/* global SingletonRouter */
import test from 'ava'
// for testing purpose import the unminified version
// import sinon from 'sinon'
import jsdom from 'jsdom'

let router

test.afterEach(t => {
  router = {}
})

test('Resolve static routes', t => {
  t.plan(1)
  jsdom.env(`<html><head></head><body></body></html>`, ['https://unpkg.com/singleton-router@1.0.1/dist/bundle.min.js'], (err, window) => {
    t.ifError(err)
    router = SingletonRouter()
    router.addRoute('/', () => {})
    router.setRoot('/')
    router.start()

    t.pass()
  })
})

// Resolve params in routes

// Manage history state

// Callbacks are fired afetr view is mounted

// Can set onRender and onNavClick functions

// When store is set, it will be pass over all the routes

// Custom root element

// Programmatically navigate
