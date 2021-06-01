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

const locationSchema = new mongoose.Schema({
  address: {
    type: String,
    maxlength: 150,
    default: "",
  },
  lat: {
    type: String,
    default: "",
  },
  lng: {
    type: String,
    default: "",
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
  location: {
    type: locationSchema,
    required: true,
  },
});

const chatMessageSchema = new mongoose.Schema({
  //0 partner, 1 user
  type: {
    type: Number,
    enum: [0, 1],
    required: true,
  },
  content: {
    type: String,
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
  timePartnerReceive: {
    type: String,
    default: null,
  },
  timePartnerGetFood: {
    type: String,
    default: null,
  },
  timeDeliverDone: {
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
    enum: [
      "new",
      "finding",
      "waitConfirm",
      "picking",
      "waitPick",
      "delivering",
      "complete",
      "cancel",
    ],
    default: "new",
  },
  detail: {
    type: detailSchema,
    required: true,
  },
  note: {
    type: String,
    default: "",
  },
  distance: {
    type: Number,
    default: 0,
  },
  chat: {
    type: [chatMessageSchema],
    default: [],
  },
  reasonCancel: {
    type: [String],
    default: [],
  },
  rateDeliver: {
    type: Number,
    default: null,
  },
  code: {
    type: String,
  },
});
module.exports = mongoose.model("Order", orderSchema);
