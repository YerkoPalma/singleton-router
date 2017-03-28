// mock for document object for tests

// should satisfy
// - document.querySelectorAll      Used to get all the links with [data-route] attribute
// - document.querySelector         Used to mount the root element (expect only '#app', '' or undefined)
// - document.createElement
// - document.body

var document = require('global/document')
const inherits = require('inherits')
const EventEmitter = require('events')

function Element () {}
inherits(Element, EventEmitter)

Element.prototype.addEventListener = Element.prototype.on

var emitter = new Element()

document.querySelector = function (selector) {
  emitter.selector = selector
  return emitter
}
document.querySelectorAll = function (selector) {
  return [document.querySelector(selector), document.querySelector(selector)]
}
document.body = document.querySelector('body')
/* document.body = html`<body></body>`
document.createElement = html.createElement
 */

module.exports = document
