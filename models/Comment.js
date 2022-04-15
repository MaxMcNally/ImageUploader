const db = require("./../db")

class Comment{
    addComment(options){
        const {imageID,userID,comment} = options
        return db.prepare("INSERT INTO comments (image_id, user_id, comment) VALUES(?, ?, ?)").run(imageID, userID, comment)
    }
    getComments(imageID){
        return db.prepare("SELECT comments.comment, comments.created_at, users.username, users.id AS user_id FROM comments JOIN users ON users.id=comments.user_id JOIN user_settings ON users.id=user_settings.user_id WHERE comments.image_id=?").all(imageID)
    }
}

module.exports = Comment