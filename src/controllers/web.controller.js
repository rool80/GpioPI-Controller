
const
  fs = require('fs'),
  url = require('url'),
  logger = require('../../config/logger')

require('dotenv').config()

const main = function(req, res) {
  try {
    const
      params = url.parse(req.url, true).query,
      f = params.f

    switch (f) { // maybe
      default:
        res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' })
        fs.createReadStream(__dirname + `/../../html/main.html`).pipe(res)
    }
  } catch(err) {
    logger.error(`[web.controller.js] main ! err => ${err}`)
    res.writeHead(500, { 'Content-Type': 'application/json' }).end('Ups... Error :(')
  }
}

exports.main = main