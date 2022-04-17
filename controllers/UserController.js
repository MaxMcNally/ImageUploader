const Image = require("../models/Image")
const User = require("../models/User")
const Message = require("../models/Message")
class UserController{
    login(req,res){
        const options = {
            username: req.body.username,
            password: req.body.password
        }
        try {
            const u = new User()
            const user = u.login(options)
            if(user){
                console.log(user)
                req.flash('message', 'Login Successful');
                req.session.username = user.username
                req.session.isLoggedIn = true
                req.session.userid = user.id
                return res.redirect("/")
            }
        }
        catch(e){
            const response = {
                error: e.message,
                username: req.body.username
            }
            return res.render("login", response)
        }
        return res.render("/login", {error:'Login Unsuccessful'})
    }
    
    logout(req,res){
        req.session.destroy(()=>{
            res.redirect('/');
        })
    }

    register(req,res){
        const options = {
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        }
        const u = new User()
        try 
        {
            const results = u.register(options)
        }
        catch (e)
        {
            return res.render("register", {error: e.message})
        }
        req.flash("message", "Your registration was successful. Please login to continue.")
        res.redirect("/login")
    }
    
    getUserPage(req,res){
        const i = new Image()
        const u = new User()
        const user = u.getUserByName(req.params.username)
        console.log(user)
        const username = user.username
        if(user.account_public === 0){
            return res.render("user", {account_private: true, user})
        }
        if(username) {
            const images = i.getImagesByUser(username)
            return res.render("user", {images,user})
        }
        else {
            return res.send(404)
        }
    }

    getSettings(req, res){
        const userID = req.session.userid
        if(!userID){
            return res.redirect("/login")
        }
        const settings = new User().getSettings(userID)
        settings.username = req.session.username
        res.render("settings",{settings})
    }
    async getAvatar(req,res){
        const u = new User()
        const settings = u.getSettings(req.params.userID)

        if(settings.avatar){
            const i = new User()
            const stream = await u.retrieveAvatar(settings.avatar)
            res.set('Cache-control', 'public, max-age=300')
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
        else return null
    }
    async postSettings(req,res){
        const settings = {
            account_public : req.body.account_public === 'on' ? 1 : 0,
            username: req.body.username,
            email: req.body.email,
            userID: req.session.userid,
            avatar: "./" + req.file.path
        }

        const u = new User()
        const newSettings = await u.updateSettings(settings)
        req.session.username = newSettings.username
        const message = "Your settings have been successfully updated"
        res.render("settings", {message:message, settings: newSettings})
    }
    sendMessage(req,res){
        const {from,to, message, username} = req.body
        console.log("Sending Message to")
        console.log(req.body)
        console.log(req.messageSocketListeners)
       
        if(from && to && message && username){
            const m = new Message()
            const result = m.sendMessage({
                from,
                to,
                message
            })
            if(result.changes === 1){
                req.flash("message", `Your message to ${req.body.username} was succesfully sent`)
                if(req.messageSocketListeners.get(parseInt(to))){
                    //user is online so we notify them
                    const ws = req.messageSocketListeners.get(parseInt(to))
                    const sender = new User().getUserByID(from)
                    ws.send(JSON.stringify({
                        type: "message",
                        message: "You have a new message from " + sender.username,
                        unreadMessages: m.getUnreadMessages(parseInt(to)).count
                    }))
                }
                res.redirect("/users/" + req.body.username)
            }
            else {
                req.flash("error", `Your message was to ${req.body.username} was not sent. Please try again later`)
                res.redirect("/users/" + req.body.username)
            }
        }
        else {
            res.status(500).send("Incorrect params")
        }

    }
    getMessages(req,res){
        const m = new Message()
        const messages = m.getMessages(req.session.userid)
        m.markMessagesAsRead(req.session.userid)
        if(messages.length > 0) {
            return res.render("messages", {messages})
        }
        else {
            return res.render("messages", {message: "You have no messages. Except for this one."})
        }
    }

    deleteMessage(req,res){
        console.log("Deleting message", req.body,req.session.userid)
        const message = new Message().getMessageByID(req.body.messageID)
        const userID = parseInt(req.session.userid)
        console.log(message)
        const deleter = message.sender === userID ? "sender" : message.receiver === userID ? "receiver" : null
        console.log(deleter)
        if(!deleter){
            return res.status(401).send("Not authorized to delete this message")
        }
        new Message().deleteMessage({
            messageID : req.body.messageID,
            deleter
        })
        const messages = new Message().getMessages(req.session.userid)
        req.flash("message","Succesfully deleted message")
        res.redirect("/messages")
    }
    
}

module.exports = new UserController()