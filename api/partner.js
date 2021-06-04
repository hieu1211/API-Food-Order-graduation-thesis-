const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Partner = require("../model/Partner");
const jwtValidation = require("../middleware/jwt.validate");
const {
  registerPartnerValidation,
} = require("../middleware/register.validate");
const { loginValidationEmail } = require("../middleware/auth.validate");
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
  const { error } = loginValidationEmail(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  try {
    const partner = await Partner.findOne({
      email: req.body.email,
    });
    if (partner.password !== md5(req.body.password)) {
      return res.status(400).send("Password is wrong!");
    }
    const token = jwt.sign(
      { _id: partner._id, permission: "partner" },
      process.env.SECRET_KEY
    );
    const id = partner._id;
    res.status(200).header({ auth_token: token }).send({ token, id });
  } catch (err) {
    return res.status(400).send(err);
  }
});

router.post("/auth", (req, res) => {
  try {
    const payload = jwt.verify(
      req.header("auth_token"),
      process.env.SECRET_KEY
    );
    if (!payload || payload.permission !== "partner")
      res.status(400).send("Unauthorized!");
    else res.send("pass");
  } catch (error) {
    res.status(400).send("Unauthorized!");
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

router.get("/profile", jwtValidation, async (req, res) => {
  try {
    const payload = jwt.verify(
      req.header("auth_token"),
      process.env.SECRET_KEY
    );
    const profile = await Partner.findOne({ _id: payload._id }).select([
      "-password",
    ]);
    res.send(JSON.stringify(profile));
  } catch (error) {
    res.status(400).send("can't find Partner}");
  }
});

router.get("/:id", jwtValidation, async (req, res) => {
  try {
    if (
      req.permission !== "manager" &&
      (req.permission !== "merchant" || req._id !== parseInt(req.params.id))
    ) {
      const partner = await Partner.findOne({ _id: req.params.id }).select([
        "-email",
        "-password",
        "-representative",
      ]);
      res.send(partner);
    } else {
      const partner = await Partner.findOne({ _id: req.params.id });
      res.send(partner);
    }
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post("/updatesetting", jwtValidation, async (req, res) => {
  const newSetting = req.body;
  const payload = jwt.verify(req.header("auth_token"), process.env.SECRET_KEY);
  if (payload.permission === "partner") {
    let parter = await Partner.findByIdAndUpdate(
      {
        _id: payload._id,
      },
      {
        $set: {
          setting: newSetting,
        },
      },
      { new: true }
    );
    res.send(JSON.stringify(parter));
    return;
  }
  res.status(400).send("Can't update setting");
});

router.post("/changeinfo", jwtValidation, async (req, res) => {
  const newData = req.body;
  const payload = jwt.verify(req.header("auth_token"), process.env.SECRET_KEY);
  if (payload.permission === "partner") {
    let prePartner = await Partner.findOne({ _id: payload._id });
    let parter = await Partner.findByIdAndUpdate(
      {
        _id: payload._id,
      },
      {
        $set: {
          ...prePartner._doc,
          ...newData,
        },
      },
      { new: true }
    );
    res.send(JSON.stringify(parter));
    return;
  }
  res.status(400).send("Can't update indivual infomation");
});

router.post("/changepass", jwtValidation, async (req, res) => {
  const dataPass = req.body;
  const payload = jwt.verify(req.header("auth_token"), process.env.SECRET_KEY);
  if (payload.permission === "partner") {
    let parter = await Partner.findOne({ _id: payload._id });
    if (parter.password === md5(dataPass.newPass)) {
      res.send("fail1");
      return;
    } else if (parter.password !== md5(dataPass.oldPass)) {
      res.send("fail2");
      return;
    } else {
      let parter = await Partner.findByIdAndUpdate(
        {
          _id: payload._id,
        },
        {
          $set: {
            password: md5(dataPass.newPass),
          },
        },
        { new: true }
      );
      res.send("Success");
      return;
    }
  }
  res.status(400).send("Can't change password");
});

module.exports = router;
