const express = require('express')
const router = express.Router();
const {registerValidate} = require('../middleware/validation/auth.validate')
const User = require('../model/User')
const md5 = require('md5')

router.post('/',(req,res)=>res.send('hello'))
router.post('/register',async (req,res)=>{
    const {error} = registerValidate(req.body)
    if(error) return res.status(400).send(error.details[0].message)
    const user = new User({...req.body,password:md5(req.body.password)})
    try{
        const savedUser = await user.save()
        res.send(savedUser)
    }
    catch(error){
        res.status(400).send(error)
    }
})

module.exports = router