const Follow = require('./../models/Follow')

class FollowerController{
    async follow(req, res){
        if(req.body.userid && req.session.userid){
            const followResponse = await new Follow().follow({
                followerID: req.session.userid, followID: req.body.userid
            })
            if(followResponse.rowCount){
                const ws = req.messageSocketListeners.get(parseInt(req.body.userid))
                if(ws){
                    ws.send(JSON.stringify({
                        type: "follower",
                        message: req.session.username + " is now following you",
                        username: req.session.username
                    }))
                }
                req.flash("message", "You are now following " + req.body.username)
                res.redirect("/users/" + req.body.username)
            }
        }
    }

    async unfollow(req,res){
        if(req.body.userid && req.session.userid){
            const followResponse = await new Follow().unfollow({
                followerID: req.session.userid, followID:req.body.userid
            })
            if(followResponse.rowCount){
                req.flash("message", "You are no longer following " + req.body.username)
                res.redirect("/users/" + req.body.username)
            }
        }
    }
}

module.exports = new FollowerController()