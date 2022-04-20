const db = require("../db")

class Like{
    async like(options){
        const {imageID, userID} = options
        await db.query("INSERT INTO likes (image_id, liked_by) VALUES ($1,$2)",[imageID,userID]) 
        return await db.query("SELECT count(*), (SELECT user_id FROM images WHERE id=$1) AS user_id FROM likes WHERE image_id=$1",[imageID])
    }
    async unlike(options){
        const {imageID, userID} = options
        await db.query("DELETE FROM likes WHERE image_id=$1 AND liked_by=$2",[imageID,userID]) 
        return await db.query("SELECT count(*) FROM likes WHERE image_id=$1",[imageID])
    }
    async getLikes(imageID){

    }
}


module.exports = Like