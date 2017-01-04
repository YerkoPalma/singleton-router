<h1 align="center">singleton-router</h1>
<br />
<div align="center">
  <!-- Stability -->
  <a href="https://nodejs.org/api/documentation.html#documentation_stability_index">
    <img src="https://img.shields.io/badge/stability-experimental-orange.svg?style=flat-square"
      alt="API stability" />
  </a>
  <!-- Standard -->
  <a href="https://github.com/feross/standard">
    <img src="https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square"
      alt="Standard" />
  </a>
  <!-- Build -->
  <a href="https://travis-ci.org/YerkoPalma/singleton-router">
    <img src="https://img.shields.io/travis/YerkoPalma/singleton-router/master.svg?style=flat-square"
      alt="Build Status" />
  </a>
</div>

## Install

```bash
$ npm install --save singleton-router
```

## Usage

```js
import SingletonRouter from 'singleton-router'

const router = SingletonRouter()
// each view is a function that returns an htmlElement object
router.addRoute('/', HomeView)
// callback is fired after new element (view) is mounted
router.addRoute('/about', AboutView, () => { console.log('Content mounted to DOM') })
router.addRoute('/user/:id', UserView)
// starting route
router.setRoot('/')
// element to mount router, if not set will mount on body element
router.start('#app')
```

In your html, any clickeable element with an attribute `data-route` would navigate to the route specified there. So, for example, an anchor tag like `<a data-route="/about"></a>` would navigate to the `AboutView`.
Programatic navigation can be done with the [`router.goToPath`](#router.goToPath(path [, title])) function.

## API

### const router = SingletonRouter([options])

There is a single function exposed, the function returns the instance of the router. The instance is also saved to the global window object as `RouterInstance_`. It accepts an optional `options` object, the availaible options are:

- onRender(currentView, previousView): By default, the router use the [`replaceChild`](https://developer.mozilla.org/en-US/docs/Web/API/Node/replaceChild) function to render the view, you can replace it to add animations, or use some html diffing function to improve performance. Notice that the function is ran inside a [`requestAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame) call, so don't need to include it yourself.
- onNavClick(path, element): If provided, is executed after any element with the `data-route` attribute in it. Useful to mark `active` links in navigation menus.

### router.setStore(store)

Set a store container, like [redux](https://github.com/reactjs/redux) for example. This store is passed to each view.

### router.addRoute(path, view [, callback])

Add routes to the router. The arguments are:

- `path`: A string with the path of the route.
- `view`: A function that returns an HtmlElement, the function hast two arguments:
  - `params`: The value of the params for that route.
  - `store`: the store object set before by `router.setStore`.
  - `callback`: Optional function that runs after the view is rendered to the DOM.

### router.setRoot(path)

Set a starting route

### router.goToPath(path [, title])

Programmatically navigates to a route. Optionally add a title for the `history` api.

### router.start([selector])

Start the router. This function receive a selector to mount the app, if none is provided, it will replace and update the `body` od the document.

## Licencia

[MIT](/license) © [Yerko Palma](https://github.com/YerkoPalma).
