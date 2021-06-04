const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Order = require("../model/Order");
const jwtValidation = require("../middleware/jwt.validate");
const md5 = require("md5");

function getSunday(d) {
  d = new Date(parseInt(d));
  var day = d.getDay(),
    diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
  return new Date(d.setDate(diff + 6));
}

function getMonday(d) {
  d = new Date(parseInt(d));
  var day = d.getDay(),
    diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
  return new Date(d.setDate(diff));
}

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

router.get("/getfindingpartner", jwtValidation, async (req, res) => {
  try {
    const payload = jwt.verify(
      req.header("auth_token"),
      process.env.SECRET_KEY
    );

    if (payload.permission === "partner") {
      const orders = await Order.find({
        status: { $nin: ["new", "delivering", "complete", "cancel"] },
        deliverId: null,
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

router.get("/getbypartner", jwtValidation, async (req, res) => {
  try {
    const payload = jwt.verify(
      req.header("auth_token"),
      process.env.SECRET_KEY
    );
    const partnerId = req.query.id;
    if (
      payload.permission === "manager" ||
      (payload.permission === "partner" && payload._id == partnerId)
    ) {
      const orders = await Order.find({
        deliverId: partnerId,
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

router.get("/getallmyorder", jwtValidation, async (req, res) => {
  try {
    const payload = jwt.verify(
      req.header("auth_token"),
      process.env.SECRET_KEY
    );

    if (payload.permission === "user") {
      const orders = await Order.find({
        userOrderId: payload._id,
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

router.get("/getchatdata", jwtValidation, async (req, res) => {
  try {
    const payload = jwt.verify(
      req.header("auth_token"),
      process.env.SECRET_KEY
    );
    const orderId = req.query.id;
    if (payload.permission === "manager" || payload.permission === "partner") {
      const order = await Order.findOne({
        _id: orderId,
      });
      res.send(order.chat);
    }
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/getbyid", jwtValidation, async (req, res) => {
  try {
    const payload = jwt.verify(
      req.header("auth_token"),
      process.env.SECRET_KEY
    );
    const orderId = req.query.id;
    if (payload.permission === "manager") {
      const order = await Order.findOne({
        _id: orderId,
      })
        .populate("userOrderId")
        .populate("merchantId")
        .populate("deliverId");
      res.send(order);
    }
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/ordersinweek", jwtValidation, async (req, res) => {
  const dateTime = req.query.time;
  if (req.permission == "partner") {
    const firstWeek = +getMonday(dateTime);
    const endWeek = +getSunday(dateTime);
    const orders = await Order.find({
      deliverId: req._id,
      timeOrder: { $gt: firstWeek, $lt: endWeek },
    });
    const ordersCanceled = await Order.find({
      timeOrder: { $gt: firstWeek, $lt: endWeek },
      cancelPartner: {
        $in: req._id,
      },
    });
    return res.status(200).send({
      monday: firstWeek,
      sunday: endWeek,
      orders,
      ordersCanceled,
    });
  }
  return res.status(400).send("Unauth");
});

module.exports = router;
