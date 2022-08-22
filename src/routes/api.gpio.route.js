const 
  router = require('./router'),
  apiGpioController = require('../controllers/api.gpio.controller')

router.register('GET/api/v1/gpio/get', apiGpioController.get)
router.register('GET/api/v1/gpio/set', apiGpioController.set)
router.register('GET/api/v1/gpio/remove', apiGpioController.remove)
// router.register('GET/api/v1/gpio/webhook', apiGpioController.webhook)
