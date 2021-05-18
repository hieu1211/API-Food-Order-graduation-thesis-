const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { Merchant, Category } = require("../model/Merchant");
const jwtValidation = require("../middleware/jwt.validate");
const {
  registerMerchantValidation,
} = require("../middleware/register.validate");
const { loginValidationEmail } = require("../middleware/auth.validate");
const md5 = require("md5");

router.post("/register", jwtValidation, async (req, res) => {
  if (req.permission !== "manager") return res.status(401).send("Unauthorized");
  const { error } = registerMerchantValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const merchant = new Merchant({
    ...req.body,
  });
  try {
    const savedMerchant = await merchant.save();
    return res.send(savedMerchant);
  } catch (err) {
    return res.status(200).send(err);
  }
});

router.post("/login", async (req, res) => {
  const { error } = loginValidationEmail(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  try {
    const merchant = await Merchant.findOne({
      email: req.body.email,
    });
    if (merchant.password !== md5(req.body.password)) {
      return res.status(400).send("Password is wrong!");
    }
    const token = jwt.sign(
      { _id: merchant._id, permission: "merchant" },
      process.env.SECRET_KEY
    );
    const id = merchant._id;
    res.status(200).header({ auth_token: token }).send({ token, id });
  } catch (err) {
    return res.send(err);
  }
});

//check Authen after login
router.post("/auth", (req, res) => {
  try {
    const payload = jwt.verify(
      req.header("auth_token"),
      process.env.SECRET_KEY
    );
    if (!payload || payload.permission !== "merchant")
      res.status(400).send("Unauthorized!");
    else res.send("pass");
  } catch (error) {
    res.status(400).send("Unauthorized!");
  }
});

router.get("/", jwtValidation, async (req, res) => {
  try {
    if (req.permission === "manager") {
      const merchants = await Merchant.find({});
      res.send(merchants);
    } else {
      const merchants = await Merchant.find({}).select([
        "-email",
        "-password",
        "-representative",
      ]);
      res.send(merchants);
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
