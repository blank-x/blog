module.exports = {
    mysql:{
        host:'localhost',
        user:'root',
        password:'11111111',
        port:'3306',
        database:'web'
    },
    isDev: process.env.NODE_ENV  === 'dev',
    isProd:process.env.NODE_ENV === 'prod'

}
