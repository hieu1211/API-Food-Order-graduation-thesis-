const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userOrder: {
    type: mongoose.ObjectId,
    required: true,
    ref: "User",
  },
  timeOrder: {
    type: String,
    default: Date.now,
  },
  timeFinish: {
    type: String,
    default: null,
  },
  deliver: {
    type: mongoose.ObjectId,
    ref: "Partner",
  },
  merchant: {
    type: mongoose.ObjectId,
    required: true,
    ref: "Merchant",
  },
  status: {
    type: String,
    enum: ["pending", "complete", "cancel"],
  },
  detail: {
    type: detailSchema,
    required: true,
  },
  report: String,
});

const detailSchema = new mongoose.Schema({
  food: [String],
  count: Number,
  price: Number,
  fee: Number,
  discount: Number,
  total: Number,
});

module.exports = mongoose.model("Order", orderSchema);
