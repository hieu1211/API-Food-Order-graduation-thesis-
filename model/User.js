const mongoose = require("mongoose");

const infoSchema = new mongoose.Schema({
  name: {
    type: String,
    maxlength: 30,
    require: true,
  },
  gender: {
    type: String,
    enum: ["male", "female"],
    require: true,
  },
  avt: {
    type: String,
    require: true,
  },
  phone: {
    type: String,
    length: 10,
    require: true,
  },
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    minlength: 6,
    maxlength: 30,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
  info: {
    type: infoSchema,
    require: true,
  },
  favoriteMerchant: {
    type: [mongoose.ObjectId],
    ref: "Merchant",
  },
});

module.exports = mongoose.model("User", userSchema);
