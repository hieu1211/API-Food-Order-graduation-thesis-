const express = require("express");
const router = express.Router();
const jwtValidation = require("../middleware/jwt.validate");
const Voucher = require("../model/Voucher");
const jwt = require("jsonwebtoken");
const Order = require("../model/Order");

//Manager
router.get("/", jwtValidation, async (req, res) => {
  try {
    const vouchers = await Voucher.find({});
    return res.send(vouchers);
  } catch (error) {
    res.status(400).send("Unauthorized!");
  }
});

router.post("/", jwtValidation, async (req, res) => {
  try {
    if (req.permission == "manager") {
      voucher = new Voucher(req.body);
      savedVoucher = await voucher.save();
      res.send(savedVoucher);
    } else res.status(400).send("Unauthorized!");
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/remove", jwtValidation, async (req, res) => {
  try {
    if (req.permission == "manager") {
      const removed = await Voucher.findByIdAndRemove(req.body.id);
      console.log(removed);
      res.send(removed);
    } else res.status(400).send("Unauthorized!");
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/modify", jwtValidation, async (req, res) => {
  try {
    if (req.permission == "manager") {
      const modified = await Voucher.findOneAndUpdate(
        { _id: req.body.id },
        req.body.change,
        {
          new: true,
        }
      );
      res.send(modified);
    } else res.status(400).send("Unauthorized!");
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post("/check", jwtValidation, async (req, res) => {
  try {
    const modified = await Voucher.findOne({ code: req.body.code });
    const order = await Order.findOne({
      userOrderId: req._id,
      code: req.body.code,
    });
    if (modified && !order)
      if (modified.retained > 0) return res.send(modified);
      else return res.status(201).send();
    else if (modified && order) res.status(202).send();
    return res.status(400).send();
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
