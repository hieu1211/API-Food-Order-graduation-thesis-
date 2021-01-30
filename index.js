const express = require('express')
const app = express()
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const apiMerchant = require('./api/merchant')
dotenv.config()
//Connect to DB
mongoose.connect(process.env.DATABASE_CONNECT,
{ useNewUrlParser: true },
()=> console.log('Connected to DB'))

app.use('/api/merchant',apiMerchant)




app.listen(3000,()=>console.log('server listen on port 3000'))

