const { date, number } = require('@hapi/joi')
const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
    user:{
        type:mongoose.ObjectId,
        require:true,
        ref:'User'
    },
    star:{
        type:Number,
        max:5,
        min:1
    },
    content:{
        type:String,
        require:true
    },
    date:{
        type:Date,
        require:true
    }
})

const categorySchema = new mongoose.Schema({
    nameCat:{
        type:String,
        maxlength:50,
        require:true
    }
})

const representativeSchema = new mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    address:{
        type:String,
        require:true
    },
    identity:{
        type:String,
        minlength:9,
        maxlength:12,
        require:true
    },
    phone:{
        type:Number,
        length:10,
        require:true
    }
})

const locationSchema = new mongoose.Schema({
    address:{
        type:String,
        maxlength:150,
        require:true
    },
    ward:{
        type:String,
        maxlength:20,
        require:true
    },
    district:{
        type:String,
        maxlength:20,
        require:true
    }
})

const foodSchema = new mongoose.Schema({
    name:{
        type:String,
        minlength:2,
        maxlength:50,
        require:true
    },
    price:{
        type:Number,
        maxlength:8,
        require:true
    },
    catId:{
        type:mongoose.ObjectId,
        ref:'categorySchema'
    },
    img:Buffer
})

const merchantSchema = new mongoose.Schema({
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
    name:{
        type:String,
        require:true
    },
    representative:{
        type:representativeSchema,
        require:true
    },
    location:{
        type:locationSchema,
        require:true
    },
    opentime:{
        type:[String],
        require:true,
    },
    dayoff:{
        type:[Date],
    },
    avt:{
        type:String,
        require:true
    },
    foods:{
        type:[foodSchema],
        require:true,
    },
    category:{
        type:[categorySchema],
        require:true
    },
    reviews:{
        type:[reviewSchema],
    },
    status:{
        type:String,
        enum:['active','suspend'],
        default:'active',
        require:true
    },
    dateCreate:{
        type:Date,
        default:Date.now,
        require:true
    },
    deduct:{
        type:Number,
        default:10,
        maxlength:3,
        require:true
    }
})


module.exports = {
    Categorry:mongoose.model('Category',categorySchema),
    Merchant:mongoose.model('Merchant',merchantSchema)
}