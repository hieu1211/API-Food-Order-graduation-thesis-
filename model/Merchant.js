const md5 = require("md5");
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.ObjectId,
    required: true,
    ref: "User",
  },
  star: {
    type: Number,
    max: 5,
    min: 1,
  },
  content: {
    type: String,
    required: true,
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
    required: true,
  },
  price: {
    type: Number,
    maxlength: 8,
    required: true,
  },
  img: {
    type: String,
  },
  status: {
    type: Boolean,
    required: true,
    default: true,
  },
});

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    maxlength: 50,
    required: true,
  },
  foods: {
    type: [foodSchema],
    default: [],
  },
});

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

const representativeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  identity: {
    type: identitySchema,
    require: true,
  },
  phone: {
    type: String,
    length: 10,
    required: true,
  },
});

const locationSchema = new mongoose.Schema({
  address: {
    type: String,
    maxlength: 150,
    required: true,
  },
  district: {
    type: Number,
    min: 1,
    max: 12,
    required: true,
  },
  lat: {
    type: String,
    required: true,
  },
  lng: {
    type: String,
    required: true,
  },
});

const timeSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
  },
  enable: {
    type: Boolean,
    required: true,
    default: true,
  },
  time: {
    type: String,
    required: true,
  },
});

const openTimeSchema = new mongoose.Schema({
  mon: {
    type: timeSchema,
    required: true,
  },
  tue: {
    type: timeSchema,
    required: true,
  },
  wed: {
    type: timeSchema,
    required: true,
  },
  thu: {
    type: timeSchema,
    required: true,
  },
  fri: {
    type: timeSchema,
    required: true,
  },
  sat: {
    type: timeSchema,
    required: true,
  },
  sun: {
    type: timeSchema,
    required: true,
  },
});
const merchantSchema = new mongoose.Schema({
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
    default: md5("123"),
  },
  name: {
    type: String,
    required: true,
  },
  representative: {
    type: representativeSchema,
    required: true,
  },
  location: {
    type: locationSchema,
    required: true,
  },
  typeFood: {
    type: Number,
    required: true,
    enum: [0, 1],
    //0:eat     1: drink
  },
  openTime: {
    type: openTimeSchema,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  avt: {
    type: String,
    required: true,
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
    required: true,
  },
  dateCreate: {
    type: String,
    default: Date.now,
  },
  deduct: {
    type: Number,
    default: 10,
    maxlength: 3,
    required: true,
  },
});

module.exports = {
  Category: mongoose.model("Category", categorySchema),
  Merchant: mongoose.model("Merchant", merchantSchema),
};
