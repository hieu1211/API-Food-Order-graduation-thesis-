const express = require("express");
const router = express.Router();
const { loginValidation } = require("../middleware/auth.validate");
const { registerUserValidation } = require("../middleware/register.validate");
const jwtValidation = require("../middleware/jwt.validate");
const User = require("../model/User");
const md5 = require("md5");
const jwt = require("jsonwebtoken");
const { request, response } = require("express");

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
router.post("/signup", async (request, response) => {
  const signUpUser = new User({
    username: request.body.username,
    password: md5(request.body.password),
  });

  signUpUser
    .save()
    .then((data) => {
      response.json(data);
    })
    .catch((err) => {
      response.json(err);
    });
});

//User login
router.post("/login", async (req, res) => {
  const { error } = loginValidation(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  const user = await User.findOne({ username: req.body.username });
  if (!user) {
    return res.status(400).send("Username doesn't exist!");
  }
  if (user.password !== md5(req.body.password))
    return res.status(400).send("Password is wrong!");
  const token = jwt.sign(
    { _id: user._id, permission: "user" },
    process.env.SECRET_KEY
  );
  res.status(200).header({ auth_token: token }).send(token);
});

//Query user by id
router.get("/:id", jwtValidation, async (req, res) => {
  if (
    req.permission !== "manager" &&
    (req.permission !== "user" || req._id !== req.params.id)
  )
    return res.status(401).send("Unauthorized");
  try {
    const user = await User.find({ _id: req.params.id });
    res.send(user);
  } catch (err) {
    res.status(400).send(err);
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

router.post("/auth", (req, res) => {
  try {
    const payload = jwt.verify(
      req.header("auth_token"),
      process.env.SECRET_KEY
    );
    if (!payload || payload.permission !== "manager")
      res.status(400).send("Unauthorized!");
    else res.send("pass");
  } catch (error) {
    res.status(400).send("Unauthorized!");
  }
});

module.exports = router;
