const fs = require("fs")
require('dotenv').config()
const { Pool } = require('pg')
let config = {
  user: process.env.PGUSER,
  host: 'localhost',
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
}

if(process.env.NODE_ENV==="PRODUCTION"){
  config = {
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
    ssl: {
      rejectUnauthorized: false,
      ca: fs.readFileSync('server-ca.pem').toString(),
      key: fs.readFileSync('client-key.pem').toString(),
      cert: fs.readFileSync('client-cert.pem').toString(),
    },
  }
}
console.log(config)
const pool = new Pool(config)
console.log(pool)
pool.query("SELECT * FROM users").then((result)=>{
    console.log(result.rows)
})
module.exports = {
  query: (text, params, callback) => {
    try {
        return pool.query(text, params, callback)
    }
    catch(e){
        console.error(text,params)
        console.error(e)
        return e
    }
  },
}
