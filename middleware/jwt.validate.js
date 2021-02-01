const jwt = require('jsonwebtoken')

module.exports = function(req,res,next){
    try{
        const payload = jwt.verify(req.header('auth_token'),process.env.SECRET_KEY)
        console.log(payload)
        req.username = payload.username
        next()
    }
    catch(error){
        res.status(400).send(error)
    }

}