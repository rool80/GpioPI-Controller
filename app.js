const 
    http = require('http'),
    WebSocketServer = require('websocket').server,
    moment = require('moment'),
    logger = require('./config/logger.js'),
    tool = require('./src/services/tool.service.js')

// ---

global.version  = '1.00'
global.author   = 'Roland Olejár'
global.name_app = 'GpioPI Controller'

global.ws = [] // websocket connections
global.dht = [] // gpio dht sensors [4, 22] etc...

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
require('./src/routes/api.info.route')
require('./src/routes/api.gpio.route')
require('./src/routes/web.route')

// ---
wsServer = new WebSocketServer({
  httpServer: http_server,
  // You should not use autoAcceptConnections for production
  // applications, as it defeats all standard cross-origin protection
  // facilities built into the protocol and the browser.  You should
  // *always* verify the connection's origin and decide whether or not
  // to accept it.
  autoAcceptConnections: false
})

function originIsAllowed(origin) {
// put logic here to detect whether the specified origin is allowed.
return true
}

wsServer.on('request', function(request) {
  if (!originIsAllowed(request.origin)) {
    // Make sure we only accept requests from an allowed origin
    request.reject()
    logger.info('Connection from origin ' + request.origin + ' rejected.')
    return
  }
  
  var connection = request.accept('gpio-ws', request.origin)
  global.ws.push(connection) // TODO: odjebat z array na on close
  logger.info('Connection accepted.')
  connection.on('message', function(message) {
    if (message.type === 'utf8') {
      logger.info('Received Message: ' + message.utf8Data)
      switch (message.utf8Data) {
        case 'Hi, I am browser and you?':
          connection.sendUTF('Hi, I am server, nice to meet you.')
          break
      }
    }
    else if (message.type === 'binary') {
      logger.info('Received Binary Message of ' + message.binaryData.length + ' bytes')
      connection.sendBytes(message.binaryData)
    }
  })
  connection.on('close', function(reasonCode, description) {
    logger.info(' Peer ' + connection.remoteAddress + ' disconnected.')
  })
})

// ---
tool.loadGPIO()
