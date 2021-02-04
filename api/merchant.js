const express = require('express')
const router = express.Router();
const jwt = require('jsonwebtoken')
const {Merchant, Category} = require('../model/Merchant')
const jwtValidation = require('../middleware/jwt.validate')
const {registerMerchantValidation} = require('../middleware/register.validate')
const {loginValidation} = require('../middleware/auth.validate')
const md5 = require('md5')


router.post('/register', async (req,res)=>{
    // if(req.permission!=='manager') return res.status(401).send('Unauthorized')
    const {error} = registerMerchantValidation(req.body)
    if(error) return res.status(400).send(error.details[0].message)
    let foods = []
    const category = []
    for(let cate of req.body.category){
        const cat = new Category({name:cate.name})
        category.push(cat)
        foods = foods.concat(cate.foods.map(food=>({...food,catId:cat})))
    }
    const merchant = new Merchant({...req.body,password:md5(req.body.password),category,foods})
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
    try{
        if(req.permission === 'manager'){
            const merchants = await Merchant.find({})
            res.send(merchants)
        }
        else{
            const merchants = await Merchant.find({}).select(["-username","-password","-representative"])
            res.send(merchants)
        }
    }
    catch(err){
        res.status(400).send(err)
    }
})

router.get('/:id', jwtValidation, async (req,res)=>{
    try{
        if(req.permission !== 'manager' && (req.permission !== 'merchant' || req._id !==parseInt(req.params.id))) {
            const merchants = await Merchant.findOne({_id:req.params.id}).select(["-username","-password","-representative"])
            res.send(merchants)
        }
        else{
            const merchants = await Merchant.findOne({_id:req.params.id})
            res.send(merchants)
        }
    }      
    catch(err){
        res.status(400).send(err)
    }
})



module.exports = router