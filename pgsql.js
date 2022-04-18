require('dotenv').config()
const { Pool } = require('pg')
const pool = new Pool()
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
