const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
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
    favoriteMerchant:{
        type:[mongoose.ObjectId]
    }
})

const infoSchema = new mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    gender:{
        type:String,
        enum: ['male', 'female'],
        require:true
    },
    avt:{
        type:Buffer,
        require:true
    },
    phone:{
        type:String,
        length:10,
        require:true
    },
})

module.exports = mongoose.model('User',userSchema)