const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
});

const detailSchema = new mongoose.Schema({
  foods: {
    type: [foodSchema],
    required: true,
  },
  fee: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
});

const orderSchema = new mongoose.Schema({
  userOrderId: {
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
  deliverId: {
    type: mongoose.ObjectId,
    ref: "Partner",
  },
  merchantId: {
    type: mongoose.ObjectId,
    required: true,
    ref: "Merchant",
  },
  status: {
    type: String,
    enum: ["processing", "complete", "cancel"],
  },
  detail: {
    type: detailSchema,
    required: true,
  },
  report: String,
});
module.exports = mongoose.model("Order", orderSchema);
