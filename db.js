const md5 = require("md5")
const DBSOURCE = "./db/image-uploader.db"
const util = require('util');
require('dotenv').config()
 //https://github.com/JoshuaWise/better-sqlite3/blob/HEAD/docs/api.md
const db = require('better-sqlite3')(DBSOURCE, {
    verbose: console.info
});

module.exports = db