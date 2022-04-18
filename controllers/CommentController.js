const Comment = require("./../models/Comment")
const Image = require("./../models/Image")
class CommentController {
    async addComment(req,res) {
        const {imageID, userID, comment} = req.body  
        const c = new Comment()
        const result = await c.addComment({
            imageID,
            userID,
            comment
        })
        const imageResult = await new Image().getImageUploader(result.rows[0].image_id)
        const imageCreatorUserID = imageResult.rows[0].id
        if(result.rows){
            req.flash("message", "Your comment was succesfully added")
            if(req.messageSocketListeners.get(imageCreatorUserID)){
                //notify user 
                const ws = req.messageSocketListeners.get(imageCreatorUserID)
                ws.send(JSON.stringify({
                    type: "comment",
                    message: req.session.username + " commented on your image",
                    imageID: result.rows[0].image_id
                }))
            }
            return res.redirect("/image/" + imageID)
        }
        else {
            req.flash("error", "Your comment could not be posted")
            return res.redirect("/image/" + imageID)
        }
    }   
}

module.exports = new CommentController()