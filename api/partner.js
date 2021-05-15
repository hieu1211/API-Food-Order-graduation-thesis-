const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Partner = require("../model/Partner");
const jwtValidation = require("../middleware/jwt.validate");
const {
  registerPartnerValidation,
} = require("../middleware/register.validate");
const { loginValidation } = require("../middleware/auth.validate");
const md5 = require("md5");

router.post("/register", jwtValidation, async (req, res) => {
  if (req.permission !== "manager") return res.status(401).send("Unauthorized");
  const { error } = registerPartnerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const partner = new Partner({
    ...req.body,
  });
  try {
    const savedPartner = await partner.save();
    return res.send(savedPartner);
  } catch (err) {
    return res.status(200).send(err);
  }
});

router.post("/login", async (req, res) => {
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  try {
    const merchant = await merchant.findOne({
      ...req.body,
      password: md5(req.body.password),
    });
    jwt.sign(
      { _id: merchant._id, permission: "merchant" },
      process.env.SECRET_KEY
    );
    res.status(200).header({ auth_token: token }).send();
  } catch (err) {
    return res.send(err);
  }
});

router.get("/", jwtValidation, async (req, res) => {
  try {
    if (req.permission === "manager") {
      const partners = await Partner.find({});
      res.send(partners);
    } else {
      const partners = await Partner.find({}).select(["-email", "-password"]);
      res.send(partners);
    }
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/search", jwtValidation, async (req, res) => {
  try {
    const nameMerchant = req.query.name;
    const nameFood = req.query.food;
    if (nameMerchant) {
      if (req.permission !== "manager") {
        const merchants = await Merchant.find({
          name: new RegExp(nameMerchant, "i"),
        });
        res.send(merchants);
      } else {
        const merchants = await Merchant.find({
          name: new RegExp(nameMerchant, "i"),
        }).select(["-email", "-password", "-representative"]);
        res.send(merchants);
      }
    } else if (nameFood) {
      const merchants = await Merchant.find({
        "category.foods.name": new RegExp(nameFood, "i"),
      }).select(["-email", "-password", "-representative"]);
      res.send(merchants);
    } else res.send({});
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/:id", jwtValidation, async (req, res) => {
  try {
    if (
      req.permission !== "manager" &&
      (req.permission !== "merchant" || req._id !== parseInt(req.params.id))
    ) {
      const merchants = await Merchant.findOne({ _id: req.params.id }).select([
        "-email",
        "-password",
        "-representative",
      ]);
      res.send(merchants);
    } else {
      const merchants = await Merchant.findOne({ _id: req.params.id });
      res.send(merchants);
    }
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router;
