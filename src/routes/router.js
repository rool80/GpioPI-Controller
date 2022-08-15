
const
  logger = require('../../config/logger.js')


const router = {
  // this is our missing route handler
  '*': (req, res) => {
    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({
      error: 'Not Found'
    }))
  },
}

function register(httpCommand, httpHandler) {
  if (router[httpCommand]) {
    throw new Error(`Command ${httpCommand} already exists.`)
  }

  router[httpCommand] = httpHandler
}

function findHandler(req) {
  let url = req.method + req.url
  if (url) {
    url = url.toString().split('?')[0]
  }
  const handler = router[url] || router['*']
  return handler
}

function bodyParser(req) {
  return new Promise((resolve, reject) => {
    if (req.method !== 'POST') {
      resolve()
      return
    }

    let data = ''

    req.on('data', (chunk) => {
      data += chunk.toString()
    })

    req.on('end', () => {
      try {
        // @ts-ignore
        req.body = JSON.parse(data)
      } catch (e) {
        // @ts-ignore
        req.body = {}
      }
      resolve()
    })

    req.on('error', (e) => {
      reject(e)
    })
  })
}

module.exports = {
  findHandler,
  register,
  bodyParser
}