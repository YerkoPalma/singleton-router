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
