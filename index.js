const express = require("express");
const app = express();

var cors = require("cors");
app.use(cors());

const dotenv = require("dotenv");
const mongoose = require("mongoose");
const apiMerchant = require("./api/merchant");
const apiUser = require("./api/user");
const apiManager = require("./api/manager");
dotenv.config();
app.use(express.urlencoded());
app.use(express.json());

//Connect to DB
mongoose.connect(process.env.DATABASE_CONNECT, { useNewUrlParser: true }, () =>
  console.log("Connected to DB")
);

app.use("/api/merchants", apiMerchant);
app.use("/api/users", apiUser);
app.use("/api/managers", apiManager);

app.listen(4000, () => console.log("server listen on port 4000"));
