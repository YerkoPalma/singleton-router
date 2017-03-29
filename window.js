// mock window object for tests

// should satisfy
// - window.RouterInstance_
// - window.addEventListener
// - window.location
// - window.history.pushState
// - window.requestAnimationFrame

const EventEmitter = require('events')
const inherits = require('inherits')
const sinon = require('sinon')

function Window () {
  this.location = {
    pathname: ''
  }
  this.history = {
    pushState: sinon.spy()
  }
}

inherits(Window, EventEmitter)

Window.prototype.addEventListener = Window.prototype.on
Window.prototype.requestAnimationFrame = function (cb) {
  var $this = window.RouterInstance_ || {}
  cb.call($this)
}

module.exports = new Window()
