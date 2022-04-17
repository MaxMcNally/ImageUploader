const db = require("./../db")
class Message{
    sendMessage(options){
        const {from,to,message} = options
        const result = db.prepare("INSERT INTO messages (sender, receiver, message) VALUES(?, ?, ?)").run(from, to, message)
        return result
    }
    getMessages(userid){
        const messages = db.prepare("SELECT messages.id, message, sent_on, unread, users.username AS sender, user_settings.avatar FROM messages JOIN user_settings ON messages.sender=user_settings.user_id JOIN users ON messages.sender=users.id WHERE receiver=? AND deleted_by_receiver=0").all(userid.toString())
        return messages
    }
    getUnreadMessages(userid){
        return db.prepare("SELECT COUNT(*) AS count FROM messages WHERE receiver=? AND deleted_by_receiver=0 AND unread=1").get(userid.toString())
    }
    getMessageByID(messageID){
        return db.prepare("SELECT * FROM messages WHERE id=?").get(messageID)
    }
    deleteMessage(options){
        const {deleter, messageID} = options
        let deleteQuery = ""
        if(deleter === "sender"){
            deleteQuery = "UPDATE messages SET deleted_by_sender=1 WHERE id=?"
        }
        else {
            deleteQuery = "UPDATE messages SET deleted_by_receiver=1 WHERE id=?"
        }
        const message = db.prepare(deleteQuery).run(messageID)
        return message
    }
    markMessagesAsRead(userID){
        return db.prepare("UPDATE messages SET unread=0 WHERE receiver=?").run(userID)
    }
}

module.exports = Message