const Comment = require("./../models/Comment")

class CommentController {
    async addComment(req,res) {
        const {imageID, userID, comment} = req.body  
        const c = new Comment()
        const result = await c.addComment({
            imageID,
            userID,
            comment
        })
        if(result.rows){
            req.flash("message", "Your comment was succesfully added")
            return res.redirect("/image/" + imageID)
        }
        else {
            req.flash("error", "Your comment could not be posted")
            return res.redirect("/image/" + imageID)
        }
    }   
}

module.exports = new CommentController()