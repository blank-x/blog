const Koa = require('koa')
const app = new Koa()

global.config  = require('./conf/mysql_config')


const errorCatch = require('./middlewares/errorCatch')

app.use(errorCatch)
// const json = require('koa-json')
// const onerror = require('koa-onerror')
// const bodyparser = require('koa-bodyparser')
// const logger = require('koa-logger')
// const koaStatic = require('koa-static')
// const session = require('koa-generic-session')
// const redisStore = require('koa-redis')
// const { isProd } = require('./utils/env')
// const path = require('path')

//路由
// const errorViewRouter = require('./routes/view/error')
// const userViewRouter = require('./routes/view/user.js')
// const blogViewRouter = require('./routes/view/blog')
// const userApiRouter = require('./routes/api/user')
// const utilsApiRouter = require('./routes/api/utils')
// const homeApiRouter = require('./routes/api/blog-home')
// const profileApiRouter = require('./routes/api/blog-profile')
// const squareApiRouter = require('./routes/api/blog-square')
// const atApiRouter = require('./routes/api/blog-at')

const blogApiRouter = require('./routes/api/blog')

// error handler：页面显示
// let onerrorConf = {}
// if (isProd) {
//     onerrorConf = { redirect: '/error' }
// }
// onerror(app, onerrorConf)

//session 配置
// const { SESSION_SECRET_KEY } = require('./conf/secretKeys')
// const { REDIS_CONF } = require('./conf/db')
// app.keys = [SESSION_SECRET_KEY]
// app.use(
//     session({
//         key: 'weibo.sid', //cookie name默认是'koa.sid'
//         prefix: 'weibo:sess:', //redis key的前缀，默认"koa:sess:"
//         cookie: {
//             path: '/',
//             httpOnly: true,
//             maxAge: 24 * 60 * 60 * 1000 //单位ms
//         },
//         store: redisStore({
//             all: `${REDIS_CONF.host}:${REDIS_CONF.port}`
//         })
//     })
// )
// middlewares
// app.use(
//     bodyparser({
//         enableTypes: ['json', 'form', 'text']
//     })
// )
// app.use(json())
// app.use(logger())
// app.use(koaStatic(path.join(__dirname, 'public')))
// app.use(koaStatic(path.join(__dirname, '..', 'uploadFiles')))
//
// app.use(
//     views(__dirname + '/views', {
//         extension: 'ejs'
//     })
// )

// routes
// app.use(userViewRouter.routes(), userViewRouter.allowedMethods())
// app.use(userApiRouter.routes(), userApiRouter.allowedMethods())
// app.use(utilsApiRouter.routes(), utilsApiRouter.allowedMethods())
// app.use(blogViewRouter.routes(), blogViewRouter.allowedMethods())
// app.use(homeApiRouter.routes(), homeApiRouter.allowedMethods())
// app.use(profileApiRouter.routes(), profileApiRouter.allowedMethods())
// app.use(squareApiRouter.routes(), squareApiRouter.allowedMethods())
// app.use(atApiRouter.routes(), atApiRouter.allowedMethods())

app.use(blogApiRouter.routes(),blogApiRouter.allowedMethods())


// app.use(errorViewRouter.routes(), errorViewRouter.allowedMethods()) //它一定放路由最后

// error-handling:打印到控制台
// app.on('error', (err, ctx) => {
//     console.error('server error', err, ctx)
// })

module.exports = app
