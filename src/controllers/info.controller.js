
const
  os = require('os')

require('dotenv').config()

const info = function(req, res) {
  try {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({
      name: global.name_app,
      uptime: os.uptime(),
      author: global.author,
      version: version
    }))
  } catch(err) {
    res.writeHead(err.status_code || 500, { 'Content-Type': 'application/json' }).end(JSON.stringify({
      name: global.name_app,
      error: err.message || err.toString()
    }))
  }
}

exports.info = info