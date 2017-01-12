/* global casper */
var utils = require('utils')

casper.test.begin('Simple static routes are rendered', 2, function suite (test) {
  casper.start('0.0.0.0:8080', function () {
    console.log('Hi there!!')
    casper.page.evaluate(function () {
      utils.bump(document)
    })
  })

  casper.then(function waitH1 () {
    test.assertExists('h1')
    test.assertSelectorHasText('h1', 'You are in home')
  })

  casper.run(function () {
    test.done()
  })
})
