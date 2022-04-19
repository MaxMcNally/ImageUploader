const {Storage} = require('@google-cloud/storage');
const db = require("./../db")
require('dotenv').config()
const { v4: uuidv4 } = require('uuid');
storage = new Storage(); 
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
            return await this.saveFileInfo({
                userID,
                destFileName,
                title
            })
        }
        catch(e){
            return e
        }
    }

    async saveFileInfo(options){
        const {destFileName, userID, title} = options
        await db.query("INSERT INTO images (user_id, url, title) VALUES ($1, $2, $3)",[userID, destFileName, title])
        return await db.query("SELECT * FROM images WHERE url=$1",[destFileName])
    }
    
    async retrieve(imageID) {
        const imageData = await db.query("SELECT images.url, images.title, users.username FROM images JOIN users ON users.id=images.user_id WHERE images.id=$1",[imageID])
        return this.retrieveByURL(imageData.rows[0].url)
    }

    async retrieveByURL(url){
        return await storage.bucket(bucketName).file(url).createReadStream()
    }
    delete(){

    }
    async getRecent(){
        return await db.query("SELECT DISTINCT(images.id), images.url, images.title, users.username, images.created_at, images.id FROM images JOIN users ON users.id=images.user_id JOIN user_settings ON user_settings.user_id=users.id WHERE user_settings.account_public=TRUE ORDER BY images.created_at LIMIT 25")
    }
    
    async getImagesByUser(username){
        return await db.query("SELECT images.url, images.title, users.username, images.created_at, images.id FROM images JOIN users ON users.id=images.user_id WHERE username=$1 ORDER BY images.created_at", [username])
    }
    
    async getImageInfo(imageID){
        return await db.query("SELECT images.title, users.username, images.created_at, images.id FROM images JOIN users ON users.id=images.user_id WHERE images.id=$1", [imageID])
    }
    async getImageUploader(imageID){
        return await db.query("SELECT users.id, users.username FROM images JOIN users ON users.id=images.user_id WHERE images.id=$1", [imageID])
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