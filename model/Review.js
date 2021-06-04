const mongoose = require("mongoose");

// const reviewerSchema = new mongoose.Schema({
//   reviewerId: {
//     type: mongoose.ObjectId,
//     required: true,
//   },
//   name: {
//     type: String,
//     required: true,
//   },
//   avt: {
//     type: String,
//     required: true,
//   },
// });

const reviewSchema = new mongoose.Schema({
  rate: {
    type: Number,
    required: true,
  },
  text: {
    type: String,
    default: "",
  },
  typeReview: {
    type: Number, //parter or merchant
    enum: [1, 2],
    required: true,
  },
  timeReview: {
    type: String,
    default: Date.now,
  },
  orderId: {
    type: mongoose.ObjectId,
    required: true,
  },
  reviewer: {
    type: mongoose.ObjectId,
    required: true,
    ref: "User",
  },
  beReviewerId: {
    type: mongoose.ObjectId,
    required: true,
  },
});

module.exports = mongoose.model("Review", reviewSchema);
