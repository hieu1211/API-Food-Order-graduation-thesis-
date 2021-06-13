const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Order = require("../model/Order");
const User = require("../model/User");
const Partner = require("../model/Partner");
const { Merchant } = require("../model/Merchant");
const jwtValidation = require("../middleware/jwt.validate");
const md5 = require("md5");

function getSunday(d) {
  d = new Date(parseInt(d));
  var day = d.getDay(),
    diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
  return new Date(new Date(d.setDate(diff + 6)).setHours(23));
}

function getMonday(d) {
  d = new Date(parseInt(d));
  var day = d.getDay(),
    diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
  return new Date(new Date(d.setDate(diff)).setHours(0));
}

function getLastDayInMonth(d) {
  var date = new Date(+d),
    y = date.getFullYear(),
    m = date.getMonth();
  return new Date(y, m + 1, 0);
}

function getFirstDayInMonth(d) {
  var date = new Date(+d),
    y = date.getFullYear(),
    m = date.getMonth();
  return new Date(y, m, 1);
}

function getLastDayInYear(d) {
  var date = new Date(+d),
    y = date.getFullYear(),
    m = date.getMonth();
  return new Date(y, 12, 30);
}

function getFirstDayInYear(d) {
  var date = new Date(+d),
    y = date.getFullYear(),
    m = date.getMonth();
  return new Date(y, 1, 1);
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
    console.log(payload.permission);
    if (payload.permission === "user") {
      const orders = await Order.find({
        userOrderId: payload._id,
      })
        .populate("userOrderId")
        .populate("merchantId")
        .populate("deliverId");
      res.send(orders);
    } else if (payload.permission === "merchant") {
      const orders = await Order.find({
        merchantId: payload._id,
      })
        .populate("userOrderId")
        .populate("merchantId")
        .populate("deliverId");
      res.send(orders);
    } else if (payload.permission === "partner") {
      const orders = await Order.find({
        deliverId: payload._id,
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
  const firstWeek = +getMonday(dateTime);
  const endWeek = +getSunday(dateTime);
  console.log(firstWeek, endWeek);
  if (req.permission == "partner") {
    const orders = await Order.find({
      deliverId: req._id,
      timeOrder: { $gt: firstWeek, $lt: endWeek },
    }).populate("reviewPartner");
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
  } else if (req.permission == "merchant") {
    const orders = await Order.find({
      merchantId: req._id,
      timeOrder: { $gt: firstWeek, $lt: endWeek },
    })
      .populate("reviewMerchant")
      .populate("merchantId");
    return res.status(200).send({
      monday: firstWeek,
      sunday: endWeek,
      orders,
    });
  }
  return res.status(400).send("Unauth");
});

router.get("/ordersinmonth", jwtValidation, async (req, res) => {
  const dateTime = req.query.time;
  const firstDay = +getFirstDayInMonth(dateTime);
  const lastDay = +getLastDayInMonth(dateTime);
  if (req.permission == "manager") {
    const orders = await Order.find({
      status: "complete",
      timeOrder: { $gt: firstDay, $lt: lastDay },
    })
      .populate("reviewMerchant")
      .populate("merchantId")
      .populate("deliverId");
    return res.status(200).send({
      monday: firstDay,
      sunday: lastDay,
      orders,
    });
  }
});

router.get("/ordersinyear", jwtValidation, async (req, res) => {
  const dateTime = req.query.time;
  const firstDay = +getFirstDayInYear(dateTime);
  const lastDay = +getLastDayInYear(dateTime);
  if (req.permission == "manager") {
    const orders = await Order.find({
      status: "complete",
      timeOrder: { $gt: firstDay, $lt: lastDay },
    })
      .populate("reviewMerchant")
      .populate("merchantId")
      .populate("deliverId");
    return res.status(200).send({
      monday: firstDay,
      sunday: lastDay,
      orders,
    });
  }
});

router.get("/userinmonth", jwtValidation, async (req, res) => {
  const dateTime = req.query.time;
  const firstDay = +getFirstDayInMonth(dateTime);
  const lastDay = +getLastDayInMonth(dateTime);
  if (req.permission == "manager" && firstDay && lastDay) {
    const users = await User.find();
    result = users.filter(
      (us) =>
        +us._id.getTimestamp() <= lastDay && +us._id.getTimestamp() >= firstDay
    );
    return res.status(200).send(result);
  }
});

router.get("/getinmonth", jwtValidation, async (req, res) => {
  const dateTime = req.query.time;
  const firstDay = +getFirstDayInMonth(dateTime);
  const lastDay = +getLastDayInMonth(dateTime);
  if (req.permission == "manager" && firstDay && lastDay) {
    const merchants = await Merchant.find();
    result = merchants.filter(
      (us) =>
        +us._id.getTimestamp() <= lastDay && +us._id.getTimestamp() >= firstDay
    );
    return res.status(200).send(result);
  }
});

router.get("/partnerinmonth", jwtValidation, async (req, res) => {
  const dateTime = req.query.time;
  const firstDay = +getFirstDayInMonth(dateTime);
  const lastDay = +getLastDayInMonth(dateTime);
  if (req.permission == "manager" && firstDay && lastDay) {
    const partners = await Partner.find();
    result = partners.filter(
      (us) =>
        +us._id.getTimestamp() <= lastDay && +us._id.getTimestamp() >= firstDay
    );
    return res.status(200).send(result);
  }
});

module.exports = router;
