const Like = require("./../models/Like")
const Notification = require("./../models/Notifications")
class LikeController {
    async like(req,res){
        const {imageID} = req.body
        const userID = req.session.userid
        if(imageID){
            const likeResponse = await new Like().like({
                userID,
                imageID
            })
            const totalLikes = likeResponse.rows[0].count
            const ws = req.messageSocketListeners.get(likeResponse.rows[0].user_id)
            if(ws && likeResponse.rows[0].user_id !== req.session.userid){
                ws.send(JSON.stringify({
                    type: "like",
                    message: req.session.username + " liked your image",
                    imageID
                }))
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ likes: totalLikes }));
        }
        else {
            res.status(500)
            res.end(JSON.stringify({type: "error", message: "Need a valid Image ID"}))
        }
    }

    async unlike(req,res){
        const {imageID} = req.body
        const userID = req.session.userid
        if(imageID){
            const likeResponse = await new Like().unlike({
                imageID,
                userID
            })
            const totalLikes = likeResponse.rows[0].count
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ likes: totalLikes }));
        }
        else {
            res.status(500)
            res.end(JSON.stringify({type: "error", message: "Need a valid Image ID"}))
        }
    }
}

module.exports = new LikeController()