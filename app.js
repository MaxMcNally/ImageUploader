//app
const express = require('express');
const app = express();
const { WebSocketServer } = require("ws")
const messageSocketListeners = new Map()
//models
const Message = require("./models/Message")

const bodyParser = require('body-parser');
const flash = require('req-flash');
const session = require('express-session');
const sqlite = require("better-sqlite3");
const SqliteStore = require("better-sqlite3-session-store")(session)
const sessionDB = new sqlite("./db/sessions.db");
const cookieParser = require('cookie-parser');
require('dotenv').config()
app.set('view engine', 'pug')
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }));
const sessionParser = session(
    {
        store: new SqliteStore({
            client: sessionDB, 
            expired: {
              clear: true,
              intervalMs: 900000 //ms = 15min
            }
          }),
        secret:process.env.COOKIE_SECRET,
        saveUninitialized:true,
        cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 },
        resave: true
    }
)
app.use(sessionParser);
app.use(flash({ locals: 'flash' }));
app.use(cookieParser());

app.use(async function(req,res,next){
    if(req.session.username){
        res.locals.session = {
            username: req.session.username,
            isLoggedIn : req.session.isLoggedIn,
            userID : req.session.userid
        }
        const messageCount = await new Message().getUnreadMessages(req.session.userid).count
        res.locals.notifications = {
            messageCount
        }
    }
    next(null, req, res);
});

app.use(function(req,res,next){
    const _render = res.render;
    res.render = function( view, options, fn ) {
        options = options || {}
        let extendedOptions = Object.assign(
            {}, 
            options,
            { 
                session: res.locals.session, 
                message: options.message || req.flash("message"), 
                error: options.error || req.flash("error")},
            {
                notifications : res.locals.notifications
            }
            
        );
        console.log("Rendering")
        console.log(extendedOptions)
        _render.call( this, view, extendedOptions, fn );
    }
    next();
});

app.use((err, req, res, next) => {
    if(err){
        console.log("An Error Occured")
        console.log(err)
    }
})

// Authentication and Authorization Middleware
const auth = function(req, res, next) {
    if (req.session && req.session.username)
      return next();
    else
      return res.redirect('/login');
};


//Controllers
const ImageController = require("./controllers/ImageController")
const UserController = require("./controllers/UserController")
const HomeController = require("./controllers/HomeController")
const CommentController = require("./controllers/CommentController")

//includes
const path = require('path');

//for parsing multi part forms
const multer = require("multer");
const db = require('./db');
const storage = multer.diskStorage({
    destination: function(req, file, cb){
        console.log("Uplaoding file")
        console.log(file)
        cb(null, './uploads')
    },
    filename(req,file,cb){
        cb(null, file.originalname)
    }
})

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        const allowedFileTypes = [
            'image/png',
            'image/jpeg',
            'image/gif',
            'image/webp',
            'image/tiff'
        ]
        if(!allowedFileTypes.includes(file.mimetype)){
            req.flash("error","Filetype is not allowed")
            return cb(null, false)
        }
        return cb(null, true)
    }
})

//routes
app.get("/", HomeController.home)

//images
app.get("/img/:imageID", ImageController.getImage) //image server for <img src>
app.get("/avatar/:userID", UserController.getAvatar)
app.get("/image/:imageID", ImageController.imagePage) //image page
app.post("/addImage", auth, upload.single('image'), ImageController.uploadImage)

//comments
app.post("/addComment", auth,CommentController.addComment)

//messages
app.post("/message", auth, function(req,res){
    req.messageSocketListeners = messageSocketListeners
    UserController.sendMessage(req,res)
})
app.get("/messages", auth, UserController.getMessages)
app.post("/delete/message", auth, UserController.deleteMessage)
//users
app.get("/users/:username", UserController.getUserPage)  
app.get("/register", (req,res)=> res.render("register"))
app.post("/register", UserController.register)
app.get("/login", (req,res)=>res.render("login"))
app.post("/login", UserController.login)
app.get("/logout", auth, UserController.logout);
app.get("/settings", auth, UserController.getSettings);
app.post("/settings", auth, upload.single('avatar'), UserController.postSettings);
app.get("/user/:username", UserController.getUserPage)
const server = app.listen(3000)
server.on('upgrade', function (request, socket, head) {
    console.log('Parsing session from request...');
    sessionParser(request, {}, () => {
      if (!request.session.userid) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }
      console.log('Session is parsed!');
      webSocketServer.handleUpgrade(request, socket, head, function (ws) {
        webSocketServer.emit('connection', ws, request);
      });
    });
  });

//web sockets 
const webSocketServer = new WebSocketServer({ noServer:true })

webSocketServer.on("connection",function(ws,req){
    console.log("Request")
    console.log(req.session)
    const userID = req.session.userid
    messageSocketListeners.set(req.session.userid,ws)
    ws.on("message",function(message){
        console.log(`Message ${message} from ${userID}`)
    })
    ws.on('close',function(){
        messageSocketListeners.delete(userID)
    })
})
