const db = require("./../db")

class Follow {
    async follow(options){
        const {followerID, followID} = options
        return await db.query("INSERT INTO followers (user_id, followed_by) VALUES($1,$2)",[followID, followerID])
    }
    async unfollow(options){
        const {followerID, followID} = options
        return await db.query("DELETE FROM followers WHERE user_id=$1 AND followed_by=$2",[followID, followerID])
    }
    async isFollowing(options){
        const {followerID, followID} = options
        return await db.query("SELECT COUNT(*) FROM followers WHERE user_id=$1 AND followed_by=$2",[followID, followerID])
    }
    async isFollowedBy(options){
        const {followerID, followID} = options
        return await db.query("SELECT COUNT(*) FROM followers WHERE user_id=$1 AND followed_by=$2",[followID, followerID])
    }
    async getFollowers(userID){
        console.log("Getting followers for " + userID)
        return await db.query("SELECT users.username, users.id, followers.followed_by FROM followers JOIN users ON followers.followed_by=users.id WHERE followers.user_id=$1",[userID])
    }
    async getFollowing(userID){
        return await db.query("SELECT users.username, followers.followed_by FROM followers JOIN users ON followers.followed_by=users.id WHERE followers.followed_by=$1",[userID])
    }
}

module.exports = Follow