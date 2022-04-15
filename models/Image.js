const {Storage} = require('@google-cloud/storage');
const db = require("./../db")
require('dotenv').config()
const { v4: uuidv4 } = require('uuid');
const storage = new Storage(
    {
        keyFilename: "./" + process.env.GOOGLE_APPLICATION_CREDENTIALS,
        projectId: process.env.GOOGLE_PROJECT_ID
    });
const bucketName = process.env.GOOGLE_IMAGE_BUCKET;
const sharp = require('sharp');

class Image {
    async upload(options){
        const {filePath, userID, title} = options
        const image = await this.compressImage(filePath)
        const fileExtension = filePath.split(".").pop()
        const destFileName = uuidv4() + "." + fileExtension;
        try {
            await storage.bucket(bucketName).upload(image, {
                destination: destFileName,
            });
            return this.saveFileInfo({
                userID,
                destFileName,
                title
            })
        }
        catch(e){
            return e
        }
    }

    saveFileInfo(options){
        const {destFileName, userID, title} = options
        try {
            db.prepare("INSERT INTO images (user_id, url, title) VALUES (?, ?, ?)").run(userID, destFileName, title)
        }
        catch(e){
            return e
        }
        return db.prepare("SELECT * FROM images WHERE url=?").get(destFileName)
    }
    
    async retrieve(imageID) {
        const imageData = db.prepare("SELECT images.url, images.title, users.username FROM images JOIN users ON users.id=images.user_id WHERE images.id=?").get(imageID)
        return this.retrieveByURL(imageData.url)
    }
    async retrieveByURL(url){
        return await storage.bucket(bucketName).file(url).createReadStream()
    }
    delete(){

    }
    getRecent(){
        return db.prepare("SELECT images.url, images.title, users.username, images.created_at, images.id FROM images JOIN users ON users.id=images.user_id JOIN user_settings ON user_settings.user_id=users.id WHERE user_settings.account_public=1 ORDER BY images.created_at LIMIT 25").all()
    }
    getImagesByUser(username){
        return db.prepare("SELECT images.url, images.title, users.username, images.created_at, images.id FROM images JOIN users ON users.id=images.user_id WHERE username=? ORDER BY images.created_at").all(username)
    }
    getImageInfo(imageID){
        return db.prepare("SELECT images.title, users.username, images.created_at, images.id FROM images JOIN users ON users.id=images.user_id WHERE images.id=?").get(imageID)
    }
    //Return a new file path of the compressed image
    async compressImage(filePath){
        const newFilePath = "./compressed-images/" + "compressed-" + filePath.split(".")[1].split("/")[2] + ".webp"
        const metadata = await sharp(filePath).metadata();
        await sharp(filePath)
        .resize({ width: metadata.width > 1000 ? 1000 : metadata.width})
        .webp({
            nearLossless: true
          })
        .toFile(newFilePath)
        return newFilePath
    }
}

module.exports = Image