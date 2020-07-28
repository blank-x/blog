const mysql = require('mysql2/promise')
const {host,user,password,database} = require('../conf/mysql_config').mysql
let connection = null
module.exports = async function () {
    if(connection){
        console.log('has')
        return connection
    }
    console.log('hasno')

    connection = await  mysql.createConnection({
        host,
        user,
        password,
        database,
        charset: 'utf8mb4'
    })
    return connection

}

