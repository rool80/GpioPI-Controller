const 
  router = require('./router'),
  infoController = require('../controllers/info.controller')

router.register('GET/api/v1/info/', infoController.info)
// router.register('POST/api/v1/info/', infoController.niecoPost)