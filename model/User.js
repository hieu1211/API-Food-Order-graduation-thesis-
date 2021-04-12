const mongoose = require("mongoose");

const infoSchema = new mongoose.Schema({
  name: {
    type: String,
    maxlength: 30,
    default: "",
  },
  gender: {
    type: String,
    enum: ["null", "male", "female"],
    default: "null",
  },
  avt: {
    type: String,
    default: "",
  },
  phone: {
    type: String,
    length: 10,
    default: "",
  },
  email: {
    type: String,
    default: "",
  },
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    minlength: 6,
    maxlength: 30,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  info: {
    type: infoSchema,
    required: true,
    default: {},
  },
  favoriteMerchant: {
    type: [mongoose.ObjectId],
    ref: "Merchant",
  },
});

module.exports = mongoose.model("User", userSchema);
