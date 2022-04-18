const db = require("./../db")
class Message{
    async sendMessage(options){
        const {from,to,message} = options
        return await db.query("INSERT INTO messages (sender, receiver, message) VALUES($1, $2, $3)", [from, to, message])
    }
    async  getMessages(userID){
        return await db.query("SELECT messages.id, message, sent_on, unread, users.username AS sender, user_settings.avatar FROM messages JOIN user_settings ON messages.sender=user_settings.user_id JOIN users ON messages.sender=users.id WHERE (receiver=$1 AND deleted_by_receiver=false)", [userID])
    }
    async getUnreadMessages(userID){
        return await db.query("SELECT COUNT(*) AS count FROM messages WHERE (receiver=$1 AND deleted_by_receiver=false AND unread=true)", [userID])
    }
    async getMessageByID(messageID){
        return await db.query("SELECT * FROM messages WHERE id=$1", [messageID])
    }
    async deleteMessage(options){
        const {deleter, messageID} = options
        let deleteQuery = ""
        if(deleter === "sender"){
            deleteQuery = "UPDATE messages SET deleted_by_sender=true WHERE id=$1"
        }
        else {
            deleteQuery = "UPDATE messages SET deleted_by_receiver=true WHERE id=$1"
        }
        return await db.query(deleteQuery, [messageID])
    }
    async markMessagesAsRead(userID){
        return await db.query("UPDATE messages SET unread=false WHERE receiver=$1", [userID])
    }
}

module.exports = Message