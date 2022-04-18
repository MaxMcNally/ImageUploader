const Image = require("../models/Image")
const User = require("../models/User")
const Message = require("../models/Message")
class UserController{
    async login(req,res){
        const options = {
            username: req.body.username,
            password: req.body.password
        }

            const u = new User()
            const results = await u.login(options)

            if(results.rows){
                const user = results.rows[0]
                req.flash('message', 'Login Successful');
                req.session.username = user.username
                req.session.isLoggedIn = true
                req.session.userid = user.id
                return res.redirect("/")
            }
            else {
                const response = {
                    error: e.message,
                    username: req.body.username
                }
                return res.render("login", response)
            }
        }
       

    logout(req,res){
        req.session.destroy(()=>{
            res.redirect('/');
        })
    }

    async register(req,res){
        const options = {
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        }
        const u = new User()
        const results = await u.register(options)
        if(results)
        {
            req.flash("message", "Your registration was successful. Please login to continue.")
            return res.redirect("/login")
        }
        else
        {
            return res.render("register", {error: "Registration was not succesful"})
        }
    }

    async getUserPage(req,res){
        const i = new Image()
        const u = new User()
        const user = await u.getUserByName(req.params.username)
        const username = user.username
        if(user.account_public === 0){
            return res.render("user", {account_private: true, user})
        }
        if(username) {
            const images = await i.getImagesByUser(username)
            return res.render("user", {images: images.rows,user})
        }
        else {
            return res.send(404)
        }
    }

    async getSettings(req, res){
        const userID = req.session.userid
        if(!userID){
            return res.redirect("/login")
        }
        const settings = await new User().getSettings(userID)
        const userSettings = settings.rows[0]
        userSettings.username = req.session.username
        res.render("settings",{settings:userSettings})
    }
    async getAvatar(req,res){
        const u = new User()
        const settingsResults = await u.getSettings(req.params.userID)
        const settings = settingsResults.rows[0]
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
    async sendMessage(req,res){
        const {from,to, message, username} = req.body
        
       
        if(from && to && message && username){
            const m = new Message()
            const result = await m.sendMessage({
                from,
                to,
                message
            })

            if(result.rowCount){
                req.flash("message", `Your message to ${req.body.username} was succesfully sent`)
                if(req.messageSocketListeners.get(parseInt(to))){
                    //user is online so we notify them
                    const ws = req.messageSocketListeners.get(parseInt(to))
                    const sender = await new User().getUserByID(from)
                    const unread = await m.getUnreadMessages(parseInt(to))
                    ws.send(JSON.stringify({
                        type: "message",
                        message: "You have a new message from " + sender.username,
                        unreadMessages: unread.rows.count
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
    async getMessages(req,res){
        const m = new Message()
        const messages = await m.getMessages(req.session.userid)
        const unread = await m.markMessagesAsRead(req.session.userid)
        if(messages.rowCount) {
            return res.render("messages", {messages:messages.rows})
        }
        else {
            return res.render("messages", {message: "You have no messages. Except for this one."})
        }
    }

    async deleteMessage(req,res){
        const messageResults = await new Message().getMessageByID(req.body.messageID)
        const message = messageResults.rows[0]
        const userID = parseInt(req.session.userid)
        const deleter = message.sender === userID ? "sender" : message.receiver === userID ? "receiver" : null
        if(!deleter){
            return res.status(401).send("Not authorized to delete this message")
        }
        await new Message().deleteMessage({
            messageID : req.body.messageID,
            deleter
        })
        req.flash("message","Succesfully deleted message")
        res.redirect("/messages")
    }
    
}

module.exports = new UserController()