const
  fs = require('fs')

require('dotenv').config()

const saveGPIO = (obj) => {
  try {
    fs.writeFileSync(process.env.SAVE_FILE, obj)
  } catch(err) {
    logger.error(`[gpio.service.js] saveGPIO | ! err => ${err.toString()}`)
  }
}