const Joi = require('@hapi/joi')
Joi.objectId = require('joi-objectid')(Joi)

const registerValidation = (data)=>{
    const schema = Joi.object({
        username: Joi.string().min(6).max(30).required(),
        password: Joi.string().required(),
        info: Joi.object({
            name: Joi.string().max(30).required(),
            gender: Joi.string().valid('male','female').required(),
            avt:Joi.string().required(),
            phone:Joi.number().min(10**7).max(10**9 - 1).required()
        }).required(),
        favoriteMerchant:Joi.objectId
    })
    return schema.validate(data)
}

const loginValidation = (data)=>{
    const schema = Joi.object({
        username: Joi.string().min(6).max(30).required(),
        password: Joi.string().required(),
    })
    return schema.validate(data)
}

module.exports = {
    loginValidation,
    registerValidation
}