const express = require('express')
const router = express.Router();
const jwtValidation = require('../middleware/jwt.validate')

router.get('/',jwtValidation,(req,res)=>res.send(req.username))

module.exports = router