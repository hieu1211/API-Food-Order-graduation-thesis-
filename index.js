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
app.use("/api/partners", apiPartner);

app.listen(process.env.PORT || 4000, () =>
  console.log("server listen on port 4000")
);
// const Nexmo = require("nexmo");
// const nexmo = new Nexmo({
//   apiKey: "0a88b36f",
//   apiSecret: "e6aL68gdIAxiPK75",
// });
// const options = {};
// const from = "HIEU";
// const to = 0345029068;
// const text = "vidu";
// nexmo.message.sendSms(from, to, text, options, (err, data) => {
//   console.log(err, data);
// });
