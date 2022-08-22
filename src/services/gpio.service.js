const
  Gpio = require('onoff').Gpio, // include onoff to interact with the GPIO
  gpiop = require('rpi-gpio').promise,
  gpio = require('rpi-gpio'),
  axios = require('axios').default,
  _ = require('lodash'),
  dht_sensor = require("node-dht-sensor"),
  logger = require('../../config/logger.js'),
  tool = require('./tool.service.js')

/**
 *  Watch dog pinu, ktory je ako OUT, v pripade zmeny stavu sa odosiela value => 1|0 na zadanu url adresu.
 *  @param p_pin je hodnota PIN | pin=3 gpio=2 etc...
 *  @return {object}
 *  example response: 
 *    {
 *      gpio: 2,
 *      pin: 3,
 *      value: 1
 *    }
 */
const watchPinOut = async (p_pin, p_webhook_url) => {
  try {
    let p_gpio = await Pin2Gpio(p_pin)
    gpiop.setup(p_pin, gpio.DIR_IN, gpio.EDGE_BOTH)
    .then(() => {
      // LISTEN
      gpiop.on('change', function(pin, val) {
        // logger.debug('[gpio.service.js] on_change, pin: ' + pin + ', gpio: ' + p_gpio + ' value is now ' + val)
        val = val === true ? 1 : 0
        webHook(p_webhook_url + `?gpio=${p_gpio}&pin=${p_pin}&value=${val}`)
        wsSendAll(JSON.stringify({ // RELAY etc... !!!
          type_msg: 'changed value',
          type: 'out',
          gpio: p_gpio,
          pin: p_pin,
          value: val
        }))
      })
      return { status: true }
    })
  } catch(err) {
    return { status: false, err: err }
  }
}

/**
 * Funkcia odosle spravu vsetkym pripojenym klientom cez websocket.
 * @param {*} p_msg 
 */
const wsSendAll = (p_msg) => {
  // websocket: send msg to all browsers
  for (let index = 0; index < global.ws.length; index++) {
    const connection = global.ws[index]
    connection.sendUTF(p_msg)
  }
}

/**
 *  Funkcia nastavi pin IN|OUT. 
 *    V pripade OUT nastavi hodnotu pinu na 1|0 (HIGH|LOW)
 *    V pripade IN nastavi watch na zistovanie zmeny stavu, napr.: pri motion sensor
 *  @param p_gpio je hodnota GPIO | pin=3 gpio=2 etc...
 *  @param p_type in | out | dht11 | dht22
 *  @param p_value iba v pripade p_type=out
 *  @param p_webhook_url je url adresa naktoru bude hlasit zmenu hodnoty na konkretnom pine
 *  @return {object}
 *  example response:
 *    {
 *      status: true, (true ake je vsetko ok, false ak je nieco zle) 
 *      value: 1, (v pripade OUT je to aktualna hodnota na GPIO, inak value nie je vyplnena)
 *      err: err (v pripade zlyhania obsahuje error, inak nie je vyplnene)
 *    }
 */
const setGpio = async (p_gpio, p_type, p_value, p_webhook_url, p_save) => {
  try {
    let 
      value,
      p_pin = await Gpio2Pin(parseInt(p_gpio))

    switch (p_type) {
      case 'out':
        const pout = new Gpio(p_gpio, p_type)
        pout.writeSync(p_value)
        value = pout.readSync()
        if (p_webhook_url) {
          watchPinOut(p_pin, p_webhook_url) // webhook pre OUT, websocket info pre OUT
        }
        wsSendAll(JSON.stringify({ // RELAY etc... !!!
          type_msg: 'changed value',
          type: p_type,
          gpio: p_gpio,
          pin: p_pin,
          value: value
        }))
        break
      case 'in':
        const pin = new Gpio(p_gpio, p_type, 'both')
        wsSendAll(JSON.stringify({ // PIR, MAGNETIC etc... !!! only activated
          type_msg: 'changed value',
          type: p_type,
          gpio: p_gpio,
          pin: p_pin
        }))
        pin.watch((err, val) => { // on change!!! webhook pre IN
          if (err) {
            throw err
          }
          // logger.debug('watch p_gpio ' + p_gpio + " pin " + p_pin + ", value " + val)
          if (p_webhook_url) {
            webHook(p_webhook_url + `?gpio=${p_gpio}&pin=${p_pin}&value=${val}`)
          }
          wsSendAll(JSON.stringify({ // PIR, MAGNETIC etc... !!! only watch
            type_msg: 'changed value',
            type: p_type,
            gpio: p_gpio,
            pin: p_pin,
            value: val
          }))
        })
        break
      case 'dht11':
      case 'dht22': // dht 22 or dht 11 sensor
        // ---
        let _timeout = () => {
          setTimeout(() => {
            _readSensor()
            if (global.dht.indexOf(p_gpio) > -1) { // ak sa gpio nachadza v dht, volaj dalsi timeout...
              _timeout()
            }
          }, 60000)
        }
        // ---
        var _readSensor = () => {
          logger.debug('_readSensor()')
          dht_sensor.read(dht_type, p_gpio, function(err, temperature, humidity) {
            if (!err) {
              // logger.debug(`temp: ${temperature}°C, humidity: ${humidity}%`)
              if (p_webhook_url) {
                webHook(p_webhook_url + `?gpio=${p_gpio}&pin=${p_pin}&temperature=${temperature}&humidity=${humidity}`) // webhook pre DHT
              }
              wsSendAll(JSON.stringify({ // DHT sensor !!! only watch/change
                type_msg: 'changed value',
                type: p_type,
                gpio: p_gpio,
                pin: p_pin,
                temperature: temperature,
                humidity: humidity
              }))
            } else {
              logger.error(`setPin | DHT sensor (${dht_type}) ! err => ${err.toString()}`)
            }
          })
        }
        // -------
        var dht_type = p_type === 'dht22' ? 22 : 11
        wsSendAll(JSON.stringify({ // DHT sensor !!! only activated
          type_msg: 'changed value',
          type: p_type,
          gpio: p_gpio,
          pin: p_pin,
          temperature: 1,
          humidity: 1
        }))
        global.dht.push(p_gpio) // aktivuj gpio ako dht senzor
        _readSensor()
        _timeout()
        break
    }

    if (p_save === 'true') {
      tool.saveGPIO({
        gpio: p_gpio,
        pin: p_pin,
        type: p_type,
        value: p_value,
        webhook_url: p_webhook_url
      })
    }

    return { status: true, value: value }
  } catch(err) {

    return { status: false, err: err.toString() }
  }
}

/**
 *  Funkcia vrati aktualny stav pinu true|false.
 *  @param p_gpio je hodnota GPIO | pin=3 gpio=2 etc...
 *  @return {object}
 *  example response:
 *    {
 *      status: true, (true ake je vsetko ok, false ak je nieco zle) 
 *      value: 1, (vrati aktualnu hodnotu na GPIO)
 *      err: err (v pripade zlyhania obsahuje error, inak nie je vyplnene)
 *    }
 */
const getGpio = async (p_gpio) => {
  try {
    const pin = new Gpio(p_gpio) // napr.: 17
      
    let value = pin.readSync()

    return { status: true, value: value }
  } catch(err) {

    return { status: false, err: err.toString() }
  }
}

/**
 *  Pomocna funkcia na vytvorenie webhook-u.
 *  @param p_url vytvara request na zadanu url adresu s danymi parametrami, napr.: http://server.domena?gpio=2&pin3&value=1
 */
const webHook = async (p_url) => {
  try {
    const response = await axios.get(p_url)
    // logger.debug(response.data)
  } catch (err) {
    logger.error(`[gpio.service.js] webHook | URL => ${p_url} | ! err => ${err.toString()}`)
  }
}

/**
 *  Konverzna funkcia vrati cislo PINu na RPi. Prevedie GPIO na PIN.
 *  @param p_gpio napr.: GPIO2 => PIN 3 etc...
 */
const Gpio2Pin = async (p_gpio) => {
  try {
    const pin = ['', '3.3v', 3, 5, 7, 29, 31, 26, 24, 21, 19, 23, 32, 33, 8, 10, 36, 11, 12, 35, 38, 40, 15, 16, 18, 22, 37, 13]
    return pin[p_gpio]
  } catch(err) {
    logger.error(`[gpio.service.js] Gpio2Pin ! err => ${err.toString()}`)
    return { status: false, err: err }
  }
}

/**
 *  Konverzna funkcia vrati cislo GPIO na RPi. Prevedie PIN na GPIO.
 *  @param p_pin napr.: PIN3 => GPIO 2 etc...
 */
 const Pin2Gpio = async (p_pin) => {
  try {
    const GPIO = ['', '', '', 2, '', 3, '', 4, 14, '', 15, 17, 18, 27, '', 22, 23, '', 24, 10, '', 9, 25, 11, 8, '', 7, '', '', 5, '', 6, 12, 13, '', 19, 16, 26, 20, '', 21]
    return GPIO[p_pin]
  } catch(err) {
    logger.error(`[gpio.service.js] Pin2Gpio ! err => ${err.toString()}`)
    return { status: false, err: err }
  }
}

/**
 * 
 * Odstrani nastavenie pre GPIO pin z data.json a serveru. Resetuje GPIO do defaultu.
 * @param {*} p_gpio 
 * @returns 
 */
const removeGpio = async (p_gpio) => {
  try {
    await tool.removeGPIO(p_gpio)
    await setGpio(p_gpio, 'out', 0) // resetuj, nastav na out a hodntu 0
    let index = global.dht.indexOf(p_gpio) // najdi ci je gpio v globalnej premenej dht
    if (index > -1) { // ak ano...
      global.dht.splice(index, 1) // odober
    }
    // websocket: send msg to all browsers
    for (let index = 0; index < global.ws.length; index++) {
      const connection = global.ws[index]
      connection.sendUTF(JSON.stringify({
        type_msg: 'gpio deactived',
        type: 'out',
        gpio: p_gpio
      }))
    }

    return { status: true, value: value }
  } catch(err) {

    return { status: false, err: err.toString() }
  }
}


exports.setGpio = setGpio
exports.getGpio = getGpio
exports.removeGpio = removeGpio
exports.Gpio2Pin = Gpio2Pin
exports.Pin2Gpio = Pin2Gpio
