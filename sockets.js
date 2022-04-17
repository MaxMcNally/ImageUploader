require('dotenv').config()
const { WebSocketServer } = require("ws")

module.exports = (app)=>{
    return new WebSocketServer({ server: app.listen(3333) })
}