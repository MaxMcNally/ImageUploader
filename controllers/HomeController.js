const Image = require("./../models/Image")

class HomeController {
    async home(req,res){
        const i = new Image()
        const files = i.getRecent()
        res.render('index', {
            images : files
        });
    }
}

module.exports = new HomeController()