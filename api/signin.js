const express = require('express')
const router = express.Router();

router.get('/',(req,res)=>res.send('Hello world'))
router.get('/newuser',(req,res)=>res.send('asdasd'))
module.exports = router