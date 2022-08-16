
const
  url = require('url'),
  logger = require('../../config/logger.js'),
  gpio_service = require('../services/gpio.service.js')

require('dotenv').config()

const get = async function(req, res) {
  try {
    let 
      params = url.parse(req.url, true).query,
      pin = params.pin,
      gpio = params.gpio

    if (!gpio && !pin) {
      throw { status_code: 400, message: 'At least one parameter must be filled! (pin or gpio)' }
    }
    if (!gpio) {
      gpio = await gpio_service.Pin2Gpio(parseInt(pin))
      if (gpio && gpio.status === false) {
        throw { status_code: 400, message: 'Pin parse error!', err: gpio.err }
      }
    }

    let result = await gpio_service.get_pin(parseInt(gpio))

    // ---
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({
      name: global.name_app,
      pin: pin,
      gpio: gpio,
      result: result
    }))
  } catch(err) {
    res.writeHead(err.status_code || 500, { 'Content-Type': 'application/json' }).end(JSON.stringify({
      name: global.name_app,
      error: err.message || err.toString()
    }))
  }
}

const set = async function(req, res) {
  try {
    let 
      params = url.parse(req.url, true).query,
      pin = params.pin,
      gpio = params.gpio,
      type = params.type,
      value = params.value,
      webhook = params.webhook,
      save = params.save

    if (!gpio && !pin) {
      throw { status_code: 400, message: 'At least one parameter must be filled! (pin or gpio)' }
    }
    if (!gpio) {
      gpio = await gpio_service.Pin2Gpio(parseInt(pin))
      if (gpio && gpio.status === false) {
        throw { status_code: 400, message: 'Pin parse error!', err: gpio.err }
      }
    }
    if (!type) {
      throw { status_code: 400, message: 'Parameter type is not defined!' }
    }
    if (!value) {
      throw { status_code: 400, message: 'Parameter value is not defined!' }
    }

    let result = await gpio_service.set_pin(parseInt(gpio), type, parseInt(value), webhook, save)

    // ---
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({
      gpio: 'GpioPI Controller',
      result: result
    }))
  } catch(err) {
    res.writeHead(err.status_code || 500, { 'Content-Type': 'application/json' }).end(JSON.stringify({
      name: 'GpioPI Controller',
      error: err.message || err.toString()
    }))
  }
}

const webhook = async function(req, res) {
  try {
    let 
      params = url.parse(req.url, true).query,
      pin = params.pin,
      gpio = params.gpio,
      webhook = params.webhook,
      save = params.save

    if (!gpio && !pin) {
      throw { status_code: 400, message: 'At least one parameter must be filled! (pin or gpio)' }
    }
    if (!pin) {
      pin = await gpio_service.Gpio2Pin(parseInt(gpio))
      if (pin && pin.status === false) {
        throw { status_code: 400, message: 'Gpio parse error!', err: pin.err }
      }
    }

    let result = await gpio_service.on_change(parseInt(pin), webhook, save)

    // ---
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({
      name: global.name_app,
      pin: pin,
      gpio: gpio
    }))
  } catch(err) {
    res.writeHead(err.status_code || 500, { 'Content-Type': 'application/json' }).end(JSON.stringify({
      name: global.name_app,
      error: err.message || err.toString()
    }))
  }
}

exports.get = get
exports.set = set
exports.webhook = webhook