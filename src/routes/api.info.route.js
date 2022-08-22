const 
  router = require('./router'),
  apiInfoController = require('../controllers/api.info.controller')

router.register('GET/api/v1/info', apiInfoController.info)
// router.register('POST/api/v1/info/', apiInfoController.niecoPost)