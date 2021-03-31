const md5 = require("md5");
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
  img: Buffer,
});

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    maxlength: 50,
    require: true,
  },
  foods: {
    type: [foodSchema],
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
  district: {
    type: Number,
    min: 1,
    max: 12,
    require: true,
  },
  lat: {
    type: String,
    require: true,
  },
  lng: {
    type: String,
    require: true,
  },
});

const timeSchema = new mongoose.Schema({
  label: {
    type: String,
    require: true,
  },
  enable: {
    type: Boolean,
    require: true,
    default: true,
  },
  time: {
    type: String,
    require: true,
  },
});

const openTimeSchema = new mongoose.Schema({
  mon: {
    type: timeSchema,
    require: true,
  },
  tue: {
    type: timeSchema,
    require: true,
  },
  wed: {
    type: timeSchema,
    require: true,
  },
  thu: {
    type: timeSchema,
    require: true,
  },
  fri: {
    type: timeSchema,
    require: true,
  },
  sat: {
    type: timeSchema,
    require: true,
  },
  sun: {
    type: timeSchema,
    require: true,
  },
});
const merchantSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    minlength: 6,
    maxlength: 30,
    require: true,
  },
  password: {
    type: String,
    require: true,
    default: md5("123"),
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
  typeFood: {
    type: Number,
    required: true,
    enum: [0, 1],
    //0:eat     1: drink
  },
  dayPart: {
    type: [Number],
    required: true,
    //0: Morning, 1:Afternoon 2:Evening
  },
  openTime: {
    type: openTimeSchema,
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
  category: {
    type: [categorySchema],
  },
  reviews: {
    type: [reviewSchema],
  },
  status: {
    type: String,
    enum: ["open", "close", "suspend"],
    default: "close",
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
