const mongoose = require('mongoose')

const merchantSchema = new mongoose.Schema({
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
    avt:{
        type:Buffer,
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
    }
})

const reviewSchema = new mongoose.Schema({
    user:{
        type:mongoose.ObjectId,
        require:true
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
        require:true
    }
})

const representativeSchema = new mongoose.Schema({
    nameRepre:{
        type:String,
        require:true
    },
    identity:{
        type:Number,
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
    location:{
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
    nameFood:{
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
    catId:mongoose.ObjectId,
    img:Buffer
})

module.exports = mongoose.model('Merchant',merchantSchema)