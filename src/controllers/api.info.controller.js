
const
  os = require('os'),
  fs = require('fs')

require('dotenv').config()

const info = function(req, res) {
  try {
    let data
    if (fs.existsSync(process.env.DATA_FILE)) {
      data = JSON.parse(fs.readFileSync(process.env.DATA_FILE))
      data = data.gpios || undefined
    }
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({
      name: global.name_app,
      uptime: os.uptime(),
      author: global.author,
      version: version,
      gpios_init: data
    }))
  } catch(err) {
    res.writeHead(err.status_code || 500, { 'Content-Type': 'application/json' }).end(JSON.stringify({
      name: global.name_app,
      error: err.message || err.toString()
    }))
  }
}

exports.info = info