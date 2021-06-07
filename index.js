const express = require("express");
const app = express();

var cors = require("cors");

app.use(cors());

const dotenv = require("dotenv");
const mongoose = require("mongoose");
const apiMerchant = require("./api/merchant");
const apiUser = require("./api/user");
const apiManager = require("./api/manager");
const apiPartner = require("./api/partner");
const apiOrder = require("./api/order");
const apiVoucher = require("./api/voucher");
const apiReview = require("./api/review");

const socket = require("./socket.js");

dotenv.config();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Connect to DB
mongoose.connect(process.env.DATABASE_CONNECT, { useCreateIndex: true }, () =>
  console.log("Connected to DB")
);

app.use("/api/merchants", apiMerchant);
app.use("/api/users", apiUser);
app.use("/api/managers", apiManager);
app.use("/api/partners", apiPartner);
app.use("/api/orders", apiOrder);
app.use("/api/vouchers", apiVoucher);
app.use("/api/reviews", apiReview);

let server = app.listen(process.env.PORT || 4000, () =>
  console.log("server listen on port 4000")
);
socket(server);
