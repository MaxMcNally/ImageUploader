const db = require("../db")
const User = require("./User")

class Notification{
    notificationTypes = {
        1: "New Follower",
        2: "Follow Posted",
        3: "Like",
        4: "Comment"
    }

    async getNotifications(options){
        const {userID, unread, limit} = options
        let query = "SELECT * FROM notifications WHERE user_id=$1"
        if(unread){
            query += " AND unread=TRUE"
        }
        if(limit){
            query += " LIMIT " + limit
        }
        return await db.query(query,[userID])
    }
    
    async addNotification(options){
        const {userID, type, from, imageID} = options
        if(imageID){
            return await db.query(`INSERT INTO notifications (user_id,type,"from",on) VALUES ($1,$2,$3,$4)`,[userID,type,from, imageID])
        }
        return await db.query(`INSERT INTO notifications (user_id,type,"from") VALUES ($1,$2,$3)`,[userID,type,from])
    }

    async unreadCount(userID){
        return await db.query("SELECT COUNT(*) FROM notifications WHERE user_id=$1 AND unread=TRUE", [userID])
    }

    async translateNotification(row){
        const note = {
            type: this.notificationTypes[row.type],
            from : await new User().getUserByID(row.from)
        }
        switch (row.type){
            case 1:
                note.message = `${note.from.username} is now following you`;
                note.link = `/users/${note.from.username}`;
                break;
            case 2: 
                note.message = `${note.from.username} posted a new image`;
                note.link = `/images/${row.on}`;
                break;
            case 3: 
                note.message = `${note.from.username} liked one of your images`;
                note.link = `/images/${row.on}`;
                break;
            case 4:    
                note.message = `${note.from.username} commented on one of your images`;
                note.link = `/images/${row.on}`;
                break;
        }
        return note
    }
    async clearNotifications(userID){
        return await db.query("UPDATE notifications SET unread=false WHERE user_id=$1",[userID])
    }
}

module.exports = Notification