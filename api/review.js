const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Review = require("../model/Review");
const jwtValidation = require("../middleware/jwt.validate");
const md5 = require("md5");
const User = require("../model/User");

router.post("/newreview", jwtValidation, async (req, res) => {
  const payload = jwt.verify(req.header("auth_token"), process.env.SECRET_KEY);
  const dataReview = req.body;
  if (dataReview.rate === null) {
    res.send("NotRate");
    return;
  }

  const reviewer = await User.find({ _id: dataReview.reviewer }).populated(
    "reviewer"
  );

  const review = new Review({ ...dataReview, reviewer: reviewer });
  console.log(review);

  if (payload.permission === "user") {
    const savedReview = await review.save();
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
    console.log(review);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/getreviewbymerchantid", jwtValidation, async (req, res) => {
  try {
    const merchantId = req.query.id;
    const review = await Review.find({
      beReviewerId: merchantId,
      typeReview: 1,
    });
    if (review) {
      res.send(review);
    } else {
      res.send("NotFound");
    }
    console.log(review);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
