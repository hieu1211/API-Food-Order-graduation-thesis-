const mongoose = require("mongoose");

const identitySchema = new mongoose.Schema({
  number: {
    type: String,
    required: true,
  },
  fontImg: {
    type: String,
    required: true,
  },
  backImg: {
    type: String,
    required: true,
  },
});

const partnerSchema = new mongoose.Schema({
  email: {
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
  name: {
    type: String,
    required: true,
    maxlength: 30,
  },
  identity: {

    type: identitySchema,
    require: true,
  },
  address: {
    type: String,
    require: true,
    maxlength: 50,
  },
  gender: {
    type: String,
    enum: ["male", "female"],
    required: true,
  },
  avt: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    length: 10,
    required: true,
  },
  dateCreate: {
    type: String,
    default: Date.now,
  },
});

const infoSchema = new mongoose.Schema({});

module.exports = mongoose.model("Partner", partnerSchema);
