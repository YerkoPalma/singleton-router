const send = require('send')
const http = require('http')
const parseUrl = require('parseurl')
const execa = require('execa')

const ip = process.env.IP || '0.0.0.0'
const port = process.env.PORT || 8080

const allowedRequests = [
  '/dist/bundle.js'
]

const server = http.createServer(function (req, res) {
  console.log(req.method + ' ' + req.url + ' ' + req.statusCode)
  if (req.method === 'GET') {
    if (allowedRequests.indexOf(req.url) > -1) {
      send(req, parseUrl(req).pathname, { root: __dirname }).pipe(res)
    } else {
      send(req, 'test/index.html').pipe(res)
    }
  } else {
    console.log('Relax dude! just a static test server')
    res.end()
  }
})

server.listen(port, ip, function () {
  console.log('Server running on ' + ip + ':' + port)
  execa('casperjs', ['test', 'test/e2e.js'])
    .then(function (result) {
      console.log(result.stdout)
      server.close()
    }).catch(function (err) {
      console.error(err)
      server.close()
    })
})
