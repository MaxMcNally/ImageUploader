const Comment = require("./../models/Comment")

class CommentController {
    addComment(req,res) {
        const {imageID, userID, comment} = req.body  
        const c = new Comment()
        const result = c.addComment({
            imageID,
            userID,
            comment
        })
        if(result.changes === 1){
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