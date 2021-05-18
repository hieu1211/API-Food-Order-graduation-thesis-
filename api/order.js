const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Order = require("../model/Order");
const jwtValidation = require("../middleware/jwt.validate");
const md5 = require("md5");

router.get("/getbystatus", jwtValidation, async (req, res) => {
  try {
    const payload = jwt.verify(
      req.header("auth_token"),
      process.env.SECRET_KEY
    );
    const statusOrder = req.query.status;

    if (payload.permission === "merchant") {
      const orders = await Order.find({
        status: statusOrder,
        merchantId: payload._id,
      })
        .populate("userOrderId")
        .populate("merchantId")
        .populate("deliverId");
      res.send(orders);
    } else if (payload.permission === "partner") {
      const orders = await Order.find({
        status: statusOrder,
      })
        .populate("userOrderId")
        .populate("merchantId")
        .populate("deliverId");
      res.send(orders);
    }
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router;