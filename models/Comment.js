const db = require("./../db")
class Comment{
    async addComment(options){
        const {imageID,userID,comment} = options
        return await db.query("INSERT INTO comments (image_id, user_id, comment) VALUES($1, $2, $3)", [imageID, userID, comment])        
    }
    async getComments(imageID){
        return await db.query("SELECT DISTINCT(comments.id), comments.comment, comments.created_at, users.username, users.id AS user_id FROM comments JOIN users ON users.id=comments.user_id JOIN user_settings ON users.id=user_settings.user_id WHERE comments.image_id=$1",[imageID])
    }
}

module.exports = Comment