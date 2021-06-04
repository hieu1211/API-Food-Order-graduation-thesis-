const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Review = require("../model/Review");
const jwtValidation = require("../middleware/jwt.validate");
const md5 = require("md5");
const User = require("../model/User");
const Order = require("../model/Order");

router.post("/newreview", jwtValidation, async (req, res) => {
  if (req.permission === "user") {
    const dataReview = req.body;
    if (dataReview.rate === null) {
      res.send("NotRate");
      return;
    }
    if (req.body.typeReview == 1) {
      const review = new Review({
        ...dataReview,
        reviewer: req.body.reviewer,
        merchant: req.body.beReviewerId,
      });
      const savedReview = await review.save();
      await Order.findOneAndUpdate(
        { _id: savedReview.orderId },
        {
          reviewMerchant: String(savedReview._id),
        }
      );
    } else {
      const review = new Review({
        ...dataReview,
        reviewer: req.body.reviewer,
        partner: req.body.beReviewerId,
      });
      const savedReview = await review.save();
      await Order.findOneAndUpdate(
        { _id: savedReview.orderId },
        {
          reviewPartner: String(savedReview._id),
        }
      );
    }
    return res.send(savedReview);
  }
  res.status(400).send(err);
});

router.post("/getreview", jwtValidation, async (req, res) => {
  try {
    const review = await Review.findOne({
      orderId: req.body.id,
      typeReview: req.body.type,
    });
    if (review) {
      res.send(review);
    } else {
      res.send("NotFound");
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/getreviewbymerchantid", jwtValidation, async (req, res) => {
  try {
    const merchantId = req.query.id;
    const review = await Review.find({
      merchant: merchantId,
    }).populate("reviewer");
    if (review) {
      res.send(review);
    } else {
      res.send("NotFound");
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
