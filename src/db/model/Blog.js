const createConn = require('../connection')

class Blog {
    async createBatch(data) {
        const conn = await createConn()
        const result = await conn.query('INSERT INTO `blog` (author_name,title,url,create_time) VALUES ?', [data]);
        return result
    }

    async query() {
        const conn = await createConn()
        const [result] = await conn.execute('SELECT * FROM `blog`');
        return result
    }
}

module.exports = new Blog()
