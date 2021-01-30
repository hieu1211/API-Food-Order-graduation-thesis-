const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    userOrder:{
        type:mongoose.ObjectId,
        require:true
    },
    timeOrder:{
        type:Date,
        default:Date.now
    },
    timeFinish:{
        type:Date,
        default:null
    },
    deliver:{
        type:mongoose.ObjectId
    },
    merchant:{
        type:mongoose.ObjectId,
        require:true
    },
    status:{
        type:String,
        enum:['pending','complete','cancel']
    },
    detail:{
        type:detailSchema,
        require:true
    },
})

const detailSchema = new mongoose.Schema({
    food:[String],
    count:Number,
    price:Number,
    fee:Number,
    discount:Number,
    total:Number
})

module.exports = mongoose.model('Order',orderSchema)

