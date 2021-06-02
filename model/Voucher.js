const mongoose = require("mongoose");

const voucherSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    required: true,
  },
  code: {
    type: String,
    unique: true,
    required: true,
    maxlength: 15,
    minlength: 3,
  },
  count: {
    type: Number,
    required: true,
  },
  retained: {
    type: Number,
    required: true,
  },
  img: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
  discount: {
    type: Number,
    required: true,
  },
  condition: {
    type: Number,
    required: true,
    default: 0,
  },
  valid: {
    type: Boolean,
    default: true,
  },
  banner: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Voucher", voucherSchema);
