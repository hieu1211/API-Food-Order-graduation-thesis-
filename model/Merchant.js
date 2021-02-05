const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.ObjectId,
    require: true,
    ref: "User",
  },
  star: {
    type: Number,
    max: 5,
    min: 1,
  },
  content: {
    type: String,
    require: true,
  },
  date: {
    type: String,
    default: Date.now,
  },
});

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    maxlength: 50,
    require: true,
  },
});

const representativeSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  address: {
    type: String,
    require: true,
  },
  identity: {
    type: String,
    minlength: 9,
    maxlength: 12,
    require: true,
  },
  phone: {
    type: String,
    length: 10,
    require: true,
  },
});

const locationSchema = new mongoose.Schema({
  address: {
    type: String,
    maxlength: 150,
    require: true,
  },
  ward: {
    type: String,
    maxlength: 20,
    require: true,
  },
  district: {
    type: String,
    maxlength: 20,
    require: true,
  },
});

const foodSchema = new mongoose.Schema({
  name: {
    type: String,
    maxlength: 50,
    require: true,
  },
  price: {
    type: Number,
    maxlength: 8,
    require: true,
  },
  catId: {
    type: mongoose.ObjectId,
    ref: "categorySchema",
  },
  img: Buffer,
});

const merchantSchema = new mongoose.Schema({
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
  name: {
    type: String,
    require: true,
  },
  representative: {
    type: representativeSchema,
    require: true,
  },
  location: {
    type: locationSchema,
    require: true,
  },
  openTime: {
    type: [String],
    require: true,
  },
  phone: {
    type: String,
    require: true,
  },
  avt: {
    type: String,
    require: true,
  },
  foods: {
    type: [foodSchema],
    require: true,
  },
  category: {
    type: [categorySchema],
    require: true,
  },
  reviews: {
    type: [reviewSchema],
  },
  status: {
    type: String,
    enum: ["open", "close", "suspend"],
    default: "open",
    require: true,
  },
  dateCreate: {
    type: String,
    default: Date.now,
  },
  deduct: {
    type: Number,
    default: 10,
    maxlength: 3,
    require: true,
  },
});

module.exports = {
  Category: mongoose.model("Category", categorySchema),
  Merchant: mongoose.model("Merchant", merchantSchema),
};
