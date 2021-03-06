const express = require("express");
const router = express.Router();
const { loginValidation } = require("../middleware/auth.validate");
const {
  registerUserValidation,
  signupUserValidation,
} = require("../middleware/register.validate");
const jwtValidation = require("../middleware/jwt.validate");
const User = require("../model/User");
const Order = require("../model/Order");
const md5 = require("md5");
const jwt = require("jsonwebtoken");

//User register
router.post("/register", async (req, res) => {
  const { error } = registerUserValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const user = new User({ ...req.body, password: md5(req.body.password) });
  try {
    const savedUser = await user.save();
    res.send(savedUser);
  } catch (error) {
    res.status(400).send(error);
  }
});

//User signup
router.post("/signup", async (req, res) => {
  const { error } = signupUserValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const signUpUser = new User({
    username: req.body.username,
    password: md5(req.body.password),
  });
  try {
    const savedUser = await signUpUser.save();
    res.send(savedUser);
  } catch (error) {
    res.status(400).send(error);
  }
});

//User login
router.post("/login", async (req, res) => {
  const { error } = loginValidation(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  const user = await User.findOne({ username: req.body.username });
  if (!user || user.password !== md5(req.body.password)) {
    return res.status(400).send("Tài khoản hoặc mật khẩu sai!");
  }
  if (user.blocked)
    return res
      .status(400)
      .send(
        "Tài khoản đã bị khóa! Vui lòng liên hệ CSKH để biết thêm thông tin chi tiết"
      );

  const token = jwt.sign(
    { _id: user._id, permission: "user" },
    process.env.SECRET_KEY
  );
  res.status(200).header({ auth_token: token }).send({ token, id: user._id });
});

router.post("/changeprofile", jwtValidation, async (req, res) => {
  const newData = req.body;
  const payload = jwt.verify(req.header("auth_token"), process.env.SECRET_KEY);
  if (payload.permission === "user") {
    const preUser = await User.findOne({ _id: payload._id });
    let user = await User.findOneAndUpdate(
      { _id: payload._id },
      {
        $set: {
          info: {
            ...preUser.info._doc,
            ...newData,
          },
        },
      },
      {
        new: true,
      }
    );
    res.send(JSON.stringify(user));
    return;
  }
  res.status(400).send("Can't update profile");
});

router.post("/changephone", jwtValidation, async (req, res) => {
  const newData = req.body;
  const payload = jwt.verify(req.header("auth_token"), process.env.SECRET_KEY);
  if (payload.permission === "user") {
    try {
      let savedUser = await User.findOneAndUpdate(
        { _id: payload._id, password: md5(newData.pass) },
        {
          $set: {
            "info.phone": newData.phone,
          },
        },
        {
          new: true,
        }
      );
      res.send(JSON.stringify(savedUser));
      return;
    } catch {
      res.status(400).send("Can't update phone");
    }
  }
  res.status(400).send("Can't update phone");
});

router.post("/auth", (req, res) => {
  try {
    const payload = jwt.verify(
      req.header("auth_token"),
      process.env.SECRET_KEY
    );
    if (!payload || payload.permission !== "user")
      res.status(400).send("Unauthorized!");
    else res.send("pass");
  } catch (error) {
    res.status(400).send("Unauthorized!");
  }
});

//Query all user
router.get("/", async (req, res) => {
  try {
    const user = await User.find({});
    res.send(user);
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
    const profile = await User.findOne({ _id: payload._id }).select([
      "-password",
    ]);
    res.send(JSON.stringify(profile));
  } catch (error) {
    res.status(400).send("can't find User");
  }
});

router.get("/checkuniquephone", jwtValidation, async (req, res) => {
  const user = await User.findOne({ "info.phone": req.query.phone });
  if (!user) return res.status(200).send("unique");
  return res.status(400).send("Not unique");
});

router.get("/checkprestige", jwtValidation, async (req, res) => {
  const orders = await Order.find({
    userOrderId: req.query.userid,
    $or: [
      { $and: [{ reasonCancel: [] }, { status: "complete" }] },
      { reasonCancel: ["Khách không nhận đồ"] },
    ],
  });
  res.status(200).send(orders);
});

//Query user by id
router.get("/:id", jwtValidation, async (req, res) => {
  if (
    req.permission !== "manager" &&
    (req.permission !== "user" || req._id !== req.params.id)
  )
    return res.status(401).send("Unauthorized");
  try {
    const user = await User.findOne({ _id: req.params.id });
    res.send(user);
  } catch (err) {
    res.status(400).send(err);
  }
});

router.post("/changeavt", jwtValidation, async (req, res) => {
  const newData = req.body;
  const payload = jwt.verify(req.header("auth_token"), process.env.SECRET_KEY);
  if (payload.permission === "user") {
    try {
      let savedUser = await User.findOneAndUpdate(
        { _id: payload._id },
        {
          $set: {
            "info.avt": newData.avt,
          },
        },
        {
          new: true,
        }
      );
      res.send(JSON.stringify(savedUser));
      return;
    } catch {
      res.status(400).send("Can't update avatar");
    }
  }
  res.status(400).send("Can't update avatar");
});

// router.get("/getallusers", jwtValidation, async (req, res) => {
//   console.log("ccc");
//   try {
//     if (req.permission === "manager") {
//       const users = await User.find({});
//       res.send(users);
//     }
//   } catch (err) {
//     res.status(400).send(err);
//   }
// });

router.post("/blockuser", jwtValidation, async (req, res) => {
  console.log(req.body);
  if (req.permission === "manager") {
    let preUser = await User.findOneAndUpdate(
      { _id: req.body.id },
      {
        $set: {
          blocked: !req.body.blocked,
        },
      },
      {
        new: true,
      }
    );
    res.send(preUser.status);
    return;
  }
  res.status(400).send("Can't update blocked");
});

module.exports = router;
