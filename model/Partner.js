const mongoose = require("mongoose");

const partnerSchema = new mongoose.Schema({
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
  },
});

const infoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 30,
  },
  identity: {
    type: Number,
    minlength: 9,
    maxlength: 12,
    required: true,
  },
  address: {
    type: String,
    required: true,
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

module.exports = mongoose.model("Partner", partnerSchema);
