const md5 = require("md5")
const DBSOURCE = "./db/image-uploader.db"
require('dotenv').config()
console.log("GET DB",process.env.USE_MYSQL)
if(process.env.USE_MYSQL){
    console.log("Should use mysql database")
}

//https://github.com/JoshuaWise/better-sqlite3/blob/HEAD/docs/api.md
const db = require('better-sqlite3')(DBSOURCE, {
    verbose: console.info
});

module.exports = db