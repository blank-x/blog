const {Blog} = require('../db/model')


async function addBlog(blogs) {
    blogs = blogs.map(item => {
        return [
            item.author_name,
            item.title,
            item.url,
            item.create_time
        ]
    })

    const result = await Blog.createBatch(blogs)
    return result
}

async function getBlogList({pageIndex}) {
    let result = await Blog.query()
    return result
}


module.exports = {
    addBlog,
    getBlogList
}
