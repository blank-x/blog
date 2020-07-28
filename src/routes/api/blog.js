const router = require('koa-router')()

const blogController  = require('../../controllers/blog')
router.prefix('/blog')
//blog
router.get('/', blogController.home)

module.exports = router
