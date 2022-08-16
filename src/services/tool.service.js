const
  fs = require('fs'),
  _ = require('lodash'),
  gpio = require('./gpio.service'),
  logger = require('../../config/logger')

require('dotenv').config()

const saveGPIO = (obj) => {
  try {
    let data
    if (!fs.existsSync(process.env.DATA_FILE)) {
      data = {
        gpios: []
      }
    } else {
        data = JSON.parse(fs.readFileSync(process.env.DATA_FILE))
    }
    const index = _.findIndex(data.gpios, function (item) {
      return item.gpio == obj.gpio
    })
    if (index > -1) {
      data.gpios[index] = obj
    } else {
      data.gpios.push(obj)
    }
    fs.writeFileSync(process.env.DATA_FILE, JSON.stringify(data))
    logger.debug(`saveGPIO => ${JSON.stringify(data)}`)
  } catch(err) {
    logger.error(`[gpio.service.js] saveGPIO | ! err => ${err.toString()}`)
  }
}

const loadGPIO = () => {
  try {
    if (fs.existsSync(process.env.DATA_FILE)) {
      logger.info(`Loading configuration file. ${process.env.DATA_FILE}`)
      let data = JSON.parse(fs.readFileSync(process.env.DATA_FILE))
      for (let index = 0; index < data.gpios.length; index++) {
        const item = data.gpios[index]
        switch (item.type) {
          case 'in':
            gpio.set_pin(item.gpio, item.type, item.value, item.webhook_url)
            break
          case 'out':
            gpio.set_pin(item.gpio, item.type, item.value)
            break
          case 'dht11':
          case 'dht22':
        }
      }
    } else {
      logger.info('No configuration file.')
    }
  } catch(err) {
    logger.error(`[gpio.service.js] loadGPIO | ! err => ${err.toString()}`)
  }
}

exports.saveGPIO = saveGPIO
exports.loadGPIO = loadGPIO