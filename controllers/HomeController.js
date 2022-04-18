const Image = require("./../models/Image")

class HomeController {
    async home(req,res){
        const i = new Image()
        const files = await i.getRecent()
        console.log("Recent images--->")
        console.log(files)
        if(files.rows){
            res.render('index', {
                images : files.rows
            })
        }
        else {
            res.render('index')
        }
        
    }
}

module.exports = new HomeController()