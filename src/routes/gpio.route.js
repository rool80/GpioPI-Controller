const 
  router = require('./router'),
  gpioController = require('../controllers/gpio.controller')

router.register('GET/api/v1/gpio/get', gpioController.get)
router.register('GET/api/v1/gpio/set', gpioController.set)
router.register('GET/api/v1/gpio/webhook', gpioController.webhook)
