const mongoose = require('mongoose')

const partnerSchema = new mongoose.Schema({
    username:{
        type:String,
        unique: true,
        minlength:6,
        maxlength:30,
        require:true
    },
    password:{
        type:String,
        require:true
    },
    info:{
        type: infoSchema,
        require:true
    },
})

const infoSchema = new mongoose.Schema({
    name:{
        type:String,
        require:true,
        maxlength:30
    },
    identity:{
        type:Number,
        minlength:9,
        maxlength:12,
        require:true
    },
    address:{
        type:String,
        require:true
    },
    gender:{
        type:String,
        enum: ['male', 'female'],
        require:true
    },
    avt:{
        type:String,
        require:true
    },
    phone:{
        type:String,
        length:10,
        require:true
    },
})


module.exports = mongoose.model('Partner',partnerSchema)