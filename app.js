const 
    http = require('http'),
    moment = require('moment'),
    logger = require('./config/logger.js'),
    tool = require('./src/services/tool.service.js')

// ---

global.version  = '1.00'
global.author   = 'Roland Olejár'
global.name_app = 'GpioPI Controller'

require('dotenv').config()

// ---

logger.info(`################################################`)
logger.info(`  ${moment().format('DD.MM.YYYY HH:mm')}                              `)
logger.info(`  GPIO controller                               `)
logger.info(`  Autor: Roland Olejár                          `)
logger.info(`     -> port: ${process.env.HTTP_PORT}                              `)
logger.info(`#^#^#^####################################^#^#^#`)

// ---
const router = require('./src/routes/router')

var http_server = http.createServer(async function(req, res) {
  await router.bodyParser(req)
  const handler = router.findHandler(req)
  handler(req, res)
})
http_server.listen(process.env.HTTP_PORT)

// ---
require('./src/routes/info.route')
require('./src/routes/gpio.route')

// ---
tool.loadGPIO()