const express = require('express')
const router = express.Router();
const {registerValidate,loginValidation} = require('../middleware/auth.validate')
const User = require('../model/User')
const md5 = require('md5')
const jwt = require('jsonwebtoken')

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

router.post('/login',async (req,res)=>{
    const {error} = loginValidation(req.body)
    if(error) return res.status(400).send(error.details[0].message)
    const user = await User.findOne({username:req.body.username})
    if(!user) return res.status(400).send("Username doesn't exist!")
    if(user.password !== md5(req.body.password)) return res.status(400).send("Password is wrong!")
    token = jwt.sign({username:user.username,info:user.info},process.env.SECRET_KEY)
    res.status(200).header({auth_token:token}).send(token)
})

module.exports = router