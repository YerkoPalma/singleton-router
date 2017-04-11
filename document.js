// mock for document object for tests

// should satisfy
// - document.querySelectorAll      Used to get all the links with [data-route] attribute
// - document.querySelector         Used to mount the root element (expect only '#app', '' or undefined)
// - document.body                  Used as default root element
// - Element.hasChildNodes          Used in manageState
// - Element.appendChild            Used in manageState
// - Element.replaceChild           Used in manageState
// - Element.firstChild             Used in manageState

var document = require('global/document')
const inherits = require('inherits')
const EventEmitter = require('events')
const sinon = require('sinon')

function Element () {}
inherits(Element, EventEmitter)

Element.prototype.addEventListener = Element.prototype.on
Element.prototype.hasChildNodes = function (fn) { return typeof fn === 'function' && fn() }
Element.prototype.appendChild = sinon.spy()
Element.prototype.replaceChild = sinon.spy()

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
