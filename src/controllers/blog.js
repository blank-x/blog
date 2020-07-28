const {getBlogList} = require('../services/blog')
const {SuccessModel, ErrorModel} = require('../services/resultWrapper')

class BlogController {
    async home(ctx, next) {
        const list = await getBlogList({pageIndex:1})
        ctx.body = new SuccessModel(list)
    }
}


module.exports = new BlogController()
