const Image = require("../models/Image")
const Comment = require("../models/Comment");
const User = require("../models/User");
const Follow = require("../models/Follow");

class ImageController{
    async getImage(req,res){
        if(req.params.imageID && isNaN(parseInt(req.params.imageID)) === false){
            const i = new Image()
            const stream = await i.retrieve(req.params.imageID)
            res.set('Cache-control', 'public, max-age=7200')
            res.writeHead(200, {'Content-Type': 'image/webp' });
            stream.on('data', function (data) {
                res.write(data);
            });
            
            stream.on('error', function (err) {
                console.log('error reading stream', err);
            });
        
            stream.on('end', function () {
                res.end();
            });
        }
        else {
            return res.send(404)
        }
    }
    
    async imagePage(req,res){
        const imageID = req.params.imageID
        const i = new Image()
        const image = await i.getImageInfo(imageID)
        if(image.rows.length > 0){
            //Get Comments
            const c = new Comment()
            const comments = await c.getComments(imageID)
            return res.render("image", {image:image.rows[0], comments: comments.rows})
        }
        else {
            res.status(404).send("Not Found")
        }

        
    }
    async uploadImage(req,res){
        const file = req.file
        const title = req.body.title
        if(!file) {
            return res.redirect("/")
        }
        const i = new Image()
        try {
            const fileInfo = await i.upload({
                userID : req.session.userid,
                filePath: "./uploads/" + req.file.filename,
                title
            })
            if(fileInfo.rows.length > 0){
                //notify followers
                const followerResponse = await new Follow().getFollowers(req.session.userid)
                console.log(followerResponse)
                for(let follower of followerResponse.rows){
                    const ws = req.messageSocketListeners.get(follower.id)
                    if(ws){
                        ws.send(JSON.stringify({
                            type: "follower_post",
                            message: req.session.username + " just added a new image",
                            imageID: fileInfo.rows[0].id
                        }))
                    }
                    console.log("Notifying",follower)
                }
                return res.render('success',
                {
                    "title": "Success",
                    "message" : "Your image was succesfully uploaded",
                    "imageID" : fileInfo.rows[0].id
                })
            }
            
        }
        catch(e) {
            console.log("Error",e)
            return res.render( "index", {error : e.message})
        }
    }
}


module.exports = new ImageController()