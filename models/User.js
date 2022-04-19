const md5 = require("md5")
const db = require("./../db")
const { v4: uuidv4 } = require('uuid');
require('dotenv').config()
const {Storage} = require('@google-cloud/storage');
const dateFormat = require("date-format")
storage = new Storage();
const bucketName = process.env.GOOGLE_AVATAR_BUCKET;
const sharp = require('sharp');

class User{
    constructor(){
        this.salt = process.env.PASSWORD_SALT
    }
   
    hash(password){
        return md5(password + this.salt)
    }
    
    async login(options){    
        const {username, password} = options
        return await db.query("SELECT username, id FROM users WHERE (username=$1 AND password=$2)",[username, this.hash(password)])
    }
    
    async register(options){
        const {username, email, password} = options
        let usersQuery = await db.query("SELECT * FROM users WHERE username=$1",[username])
        if(usersQuery.rows.length > 1)
        {
            throw new Error("User already exists. Please pick a different user name");
        }
        const user = await db.query("INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING id", [username, this.hash(password), email])
        const userID = user.rows[0].id
        await db.query("INSERT INTO user_settings (user_id, email, account_public) VALUES ($1, $2, $3)",[userID, email, 'true'])
        return userID
    }
    
    async getSettings(userID){
        return await db.query("SELECT * FROM user_settings WHERE user_id=$1",[userID])
    }
    async retrieveAvatar(url) {
        return await storage.bucket(bucketName).file(url).createReadStream()
    }

    async updateSettings(options){
        const {username, email, account_public, userID, avatar} = options
        await db.query("UPDATE user_settings SET email=$1, account_public=$2 WHERE user_id=$3", [email, account_public, userID.toString()])
        await db.query("UPDATE users SET email=$1, username=$2 WHERE id=$3",[email,username,userID.toString()])
        if(avatar){
            const avatarFile = await this.saveAvatar(avatar)
            await db.query("UPDATE user_settings SET avatar=$1 WHERE user_id=$2",[avatarFile,userID.toString()])
        }
        const userResults = await db.query("SELECT username FROM users WHERE id=$1",[userID.toString()])
        const user = userResults.rows[0]
        const settingsResults = await this.getSettings(userID)
        const settings = settingsResults.rows[0]
        return Object.assign({}, settings ,{username: user.username})
    }

    async saveAvatar(filePath){
        const imageBuffer = await sharp(filePath).webp({nearLossless: true}).toBuffer()
        const fileName = uuidv4() + ".webp"
        await storage.bucket(bucketName).file(fileName).save(imageBuffer,{
            contentType : "image/webp"
        })
        return fileName
    }

    async getUserByName(username){
        const userQuery = await db.query("SELECT users.id,username,avatar,account_public, users.created_at FROM users JOIN user_settings ON users.id=user_settings.user_id WHERE username=$1",[username])
        const user = userQuery.rows[0]
        user.created_at = dateFormat('MM/dd/yyyy', new Date(user.created_at))
        return user
    }
    async getUserByID(userID){
        const userQuery = await db.query("SELECT username,avatar,account_public, users.created_at FROM users JOIN user_settings ON users.id=user_settings.user_id WHERE users.id=$1",[userID])
        const user = userQuery.rows[0] 
        user.created_at = dateFormat('MM/dd/yyyy', new Date(user.created_at))
        return user
    }
    //TODO
    resetPasswordEmail(email){
        
    }
    //TODO
    confirmationEmail(email){

    }
    //TODO
    validateEmail(email){

    }

}

module.exports = User