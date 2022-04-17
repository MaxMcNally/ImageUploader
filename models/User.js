const md5 = require("md5")
const db = require("./../db")
const { v4: uuidv4 } = require('uuid');
require('dotenv').config()
const {Storage} = require('@google-cloud/storage');
const dateFormat = require("date-format")

const storage = new Storage(
    {
        keyFilename: "./" + process.env.GOOGLE_APPLICATION_CREDENTIALS,
        projectId: process.env.GOOGLE_PROJECT_ID
    });

const bucketName = process.env.GOOGLE_AVATAR_BUCKET;
const sharp = require('sharp');

class User{
    constructor(){
        this.salt = process.env.PASSWORD_SALT
    }
   
    hash(password){
        return md5(password + this.salt)
    }
    
    login(options){    
        const {username, password} = options
        let stmt = db.prepare("SELECT username, id FROM users WHERE username=? AND password=?")
        let user = stmt.get(username, this.hash(password))
        if(!user)
        {
            throw new Error("User doesn't exist");
        }
        return user
    }
    
    register(options){
        const {username, email, password} = options
        let users = db.prepare("SELECT * FROM users WHERE username=?")
        if(users.get(username))
        {
            throw new Error("User already exists. Please pick a different user name");
        }
        const user_stmt = db.prepare("INSERT INTO users (username, password, email) VALUES (?, ?, ?)")
        const results = user_stmt.run(username, this.hash(password), email)

        const user = users.get(username)
        const settings_stmt = db.prepare("INSERT INTO user_settings (user_id, email, account_public) VALUES (?, ?, ?)")
        const settings = settings_stmt.run(user.id, email, 1)
        return user
    }
    
    getSettings(userID){
        console.log("Getting setting for user id ", userID)
        let stmt = db.prepare("SELECT * FROM user_settings WHERE user_id=?")
        return stmt.get(userID.toString())
    }
    async retrieveAvatar(url) {
        return await storage.bucket(bucketName).file(url).createReadStream()
    }

    async updateSettings(options){
        const {username, email, account_public, userID, avatar} = options
        db.prepare("UPDATE user_settings SET email=?, account_public=? WHERE user_id=?").run(email, account_public, userID.toString())
        db.prepare("UPDATE users SET email=?, username=? WHERE id=?").run(email,username,userID.toString())
        if(avatar){
            const avatarFile = await this.saveAvatar(avatar)
            db.prepare("UPDATE user_settings SET avatar=? WHERE user_id=?").run(avatarFile,userID.toString())
        }
        const user = db.prepare("SELECT username FROM users WHERE id=?").get(userID.toString())
        return Object.assign({}, this.getSettings(userID), {username: user.username})
    }

    async saveAvatar(filePath){
        const imageBuffer = await sharp(filePath).webp({nearLossless: true}).toBuffer()
        const fileName = uuidv4() + ".webp"
        await storage.bucket(bucketName).file(fileName).save(imageBuffer,{
            contentType : "image/webp"
        })
        return fileName
    }

    getUserByName(username){
        const user = db.prepare("SELECT users.id,username,avatar,account_public, users.created_at FROM users JOIN user_settings ON users.id=user_settings.user_id WHERE username=?").get(username)
        console.log(user)
        user.created_at = dateFormat('MM/dd/yyyy', new Date(user.created_at))
        return user
    }
    getUserByID(userID){
        const user = db.prepare("SELECT username,avatar,account_public, users.created_at FROM users JOIN user_settings ON users.id=user_settings.user_id WHERE users.id=?").get(userID)
        console.log(user)
        user.created_at = dateFormat('MM/dd/yyyy', new Date(user.created_at))
        return user
    }
    resetPasswordEmail(email){

    }

    confirmationEmail(email){

    }
    
    validateEmail(email){

    }

}

module.exports = User