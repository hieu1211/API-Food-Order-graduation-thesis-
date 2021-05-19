const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { Merchant, Category, Food } = require("../model/Merchant");
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

router.post("/changecategory", jwtValidation, async (req, res) => {
  const newData = req.body;
  console.log(newData);
  const payload = jwt.verify(req.header("auth_token"), process.env.SECRET_KEY);
  if (payload.permission === "merchant") {
    let merchant = await Merchant.findOneAndUpdate(
      { _id: payload._id },
      {
        $set: {
          category: newData,
        },
      },
      {
        new: true,
      }
    );
    res.send(JSON.stringify(merchant));
    return;
  }
  res.status(400).send("Can't update category");
});

router.post("/addcategory", jwtValidation, async (req, res) => {
  const newCat = new Category({ ...req.body });
  const payload = jwt.verify(req.header("auth_token"), process.env.SECRET_KEY);

  if (payload.permission === "merchant") {
    const preMerchant = await Merchant.findOne({ _id: payload._id });
    preMerchant.category.push(newCat);
    await preMerchant.save();

    res.send(JSON.stringify(preMerchant));
    return;
  }
  res.status(400).send("Can't add category");
});

router.post("/removecategory", jwtValidation, async (req, res) => {
  const catId = req.body.catId;
  const payload = jwt.verify(req.header("auth_token"), process.env.SECRET_KEY);

  if (payload.permission === "merchant") {
    const preMerchant = await Merchant.findOne({ _id: payload._id });
    preMerchant.category.pull(catId);
    await preMerchant.save();

    res.send(JSON.stringify(preMerchant));
    return;
  }
  res.status(400).send("Can't add category");
});

router.post("/foodadd", jwtValidation, async (req, res) => {
  const payload = jwt.verify(req.header("auth_token"), process.env.SECRET_KEY);

  if (payload.permission === "merchant") {
    const preMerchant = await Merchant.findOne({ _id: payload._id });
    const catId = req.body.catId;
    const newFood = new Food({
      name: req.body.name,
      price: req.body.price,
      img: "",
      status: true,
    });

    preMerchant.category.map((cat, index) => {
      if (String(cat._id) === catId) {
        cat.foods.push(newFood);
      }
      console.log(typeof cat._id, typeof catId);
      return cat;
    });

    await preMerchant.save();

    res.send(JSON.stringify(preMerchant));
    return;
  }
  res.status(400).send("Can't add food");
});

router.post("/foodremove", jwtValidation, async (req, res) => {
  const payload = jwt.verify(req.header("auth_token"), process.env.SECRET_KEY);

  console.log(req.body);

  if (payload.permission === "merchant") {
    const preMerchant = await Merchant.findOne({ _id: payload._id });
    const indexOfCat = preMerchant.category.findIndex(
      (e) => String(e._id) === req.body.catId
    );

    preMerchant.category[indexOfCat].foods.pull(req.body.foodId);
    preMerchant.save();
    res.send(JSON.stringify(preMerchant));
    return;
  }
  res.status(400).send("Can't remove food");
});

router.post("/foodedit", jwtValidation, async (req, res) => {
  const payload = jwt.verify(req.header("auth_token"), process.env.SECRET_KEY);
  console.log(req.body);
  const newFood = {
    _id: req.body._id,
    name: req.body.name,
    price: parseInt(req.body.price),
    img: "",
    status: req.body.status,
  };

  if (payload.permission === "merchant") {
    const preMerchant = await Merchant.findOne({ _id: payload._id });

    const indexOfCatCurrent = preMerchant.category.findIndex(
      (e) => String(e._id) === req.body.catIdCurrent
    );
    const indexOfCatNew = preMerchant.category.findIndex(
      (e) => String(e._id) === req.body.catIdNew
    );
    if (indexOfCatCurrent === indexOfCatNew) {
      preMerchant.category[indexOfCatCurrent].foods.pull(req.body._id);
      preMerchant.category[indexOfCatCurrent].foods.push(newFood);
      preMerchant.save();
    } else {
      preMerchant.category[indexOfCatCurrent].foods.pull(req.body._id);
      preMerchant.category[indexOfCatNew].foods.push(newFood);
      preMerchant.save();
    }

    res.send(JSON.stringify(preMerchant));
    return;
  }
  res.status(400).send("Can't edit food");
});

router.post("/addressedit", jwtValidation, async (req, res) => {
  const newData = req.body;
  console.log(newData);
  const payload = jwt.verify(req.header("auth_token"), process.env.SECRET_KEY);
  if (payload.permission === "merchant") {
    let merchant = await Merchant.findOneAndUpdate(
      { _id: payload._id },
      {
        $set: {
          location: newData,
        },
      },
      {
        new: true,
      }
    );
    res.send(JSON.stringify(merchant));
    return;
  }
  res.status(400).send("Can't update category");
});

module.exports = router;
