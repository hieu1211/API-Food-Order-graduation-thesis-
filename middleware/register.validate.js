const Joi = require('@hapi/joi')
Joi.objectId = require('joi-objectid')(Joi)

const registerMerchantValidation = (data)=>{
    const schema = Joi.object({
        username: Joi.string().min(6).max(30).required(),
        password: Joi.string().required(),
        name:Joi.string.require(),
        representative:Joi.object({
            name:Joi.string.require(),
            address:Joi.string.require(),
            identity:Joi.string.min(9).max(12).require(),
            phone:Joi.number().min(10**7).max(10**9 - 1).required(),
        }),
        location:Joi.object({
            address: Joi.string().max(150).required(),
            ward: Joi.string().max(20).required(),
            district:Joi.string().max(20).required()
        }).required(),
        opentime:Joi.array().items(Joi.string().max(4).required()).required(),
        dayoff:Joi.array().items(Joi.date()),
        avt:Joi.string(),
        foods:Joi.array().items(Joi.object({
            name:Joi.string().min(2).max(50).required(),
            price:Joi.number().min(10**3).max(10**8-1),
            catId:Joi.objectId().required()
        })),
        category:Joi.array().items(Joi.object({
            name:Joi.string().max(50).required(),
        }))
    })
    return schema.validate(data)
}

const registerUserValidation = (data)=>{
    const schema = Joi.object({
        username: Joi.string().min(6).max(30).required(),
        password: Joi.string().required(),
        info: Joi.object({
            name: Joi.string().max(30).required(),
            gender: Joi.string().valid('male','female').required(),
            avt:Joi.string().required(),
            phone:Joi.number().min(10**7).max(10**9 - 1).required()
        }).required(),
    })
    return schema.validate(data)
}


module.exports = {
    registerMerchantValidation,
    registerUserValidation
}