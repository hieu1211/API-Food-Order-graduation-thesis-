const express = require('express')
const router = express.Router();
const jwt = require('jsonwebtoken')
const Merchant = require('../model/Merchant')
const jwtValidation = require('../middleware/jwt.validate')
const {registerMerchantValidate} = require('../middleware/register.validate')
const {loginValidation} = require('../middleware/auth.validate')

router.post('/register',jwtValidation, async (req,res)=>{
    if(req.permission!=='manager') return res.status(401).send('Unauthorized')
    const {error} = registerMerchantValidate(req.body)
    if(error) return res.status(400).send(error.details[0].message)
    const merchant = new Merchant({...req.body,password:md5(req.body.password)})
    try{
        const savedMerchant = await merchant.save()
        return res.send(savedMerchant)
    }
    catch(err){
        return res.send(err)
    }
})

router.post('/login', async (req,res)=>{
    const {error} = loginValidation(req.body)
    if(error) return res.status(400).send(error.details[0].message)
    try{
        const merchant = await merchant.findOne({...req.body, password:md5(req.body.password)})
        jwt.sign({_id:merchant._id,permission:'merchant'},process.env.SECRET_KEY)
        res.status(200).header({auth_token:token}).send()
    }
    catch(err){
        return res.send(err)
    }
})

router.get('/', jwtValidation, async (req,res)=>{
    if(req.permission !== 'manager') return res.status(401).send('Unauthorized')
    try{
        const merchants = await Merchant.find({})
        res.send(merchants)
    }
    catch(err){
        res.status(400).send(err)
    }
})

router.get('/:id', jwtValidation, async (req,res)=>{
    if(req.permission !== 'manager' && (req.permission !== 'merchant' || req._id !==parseInt(req.params.id))) 
        return res.status(401).send('Unauthorized')
    try{
        const merchants = await Merchant.find({_id:req.params.id})
        res.send(merchants)
    }
    catch(err){
        res.status(400).send(err)
    }
})

module.exports = router