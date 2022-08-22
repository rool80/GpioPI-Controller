const 
  router = require('./router'),
  webController = require('../controllers/web.controller')

router.register('GET/', webController.main)