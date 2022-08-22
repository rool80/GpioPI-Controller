const
  fs = require('fs'),
  _ = require('lodash'),
  gpio = require('./gpio.service'),
  logger = require('../../config/logger')

require('dotenv').config()

const saveGPIO = (p_obj) => {
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
      return item.gpio == p_obj.gpio
    })
    if (index > -1) {
      data.gpios[index] = p_obj
    } else {
      data.gpios.push(p_obj)
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
          // case 'in':
          // case 'out':
            
          //   break
          // case 'dht11':
          // case 'dht22':

          //   break
          default:
            gpio.setGpio(item.gpio, item.type, item.value, item.webhook_url)
        }
      }
    } else {
      logger.info('No configuration file.')
    }
  } catch(err) {
    logger.error(`[gpio.service.js] loadGPIO | ! err => ${err.toString()}`)
  }
}

const removeGPIO = (p_gpio) => {
  try {
    if (fs.existsSync(process.env.DATA_FILE)) {
      logger.info(`Removing gpio from configuration file. ${process.env.DATA_FILE}`)
      let data = JSON.parse(fs.readFileSync(process.env.DATA_FILE))
      let index = _.findIndex(data.gpios, function(o) { return o.gpio == p_gpio })
      if (index > -1) {
        data.gpios.splice(index, 1)
      }
      fs.writeFileSync(process.env.DATA_FILE, JSON.stringify(data))
      
    } else {
      logger.info('No configuration file.')
    }
  } catch(err) {
    logger.error(`[gpio.service.js] removeGPIO | ! err => ${err.toString()}`)
  }
}

exports.saveGPIO = saveGPIO
exports.loadGPIO = loadGPIO
exports.removeGPIO = removeGPIO