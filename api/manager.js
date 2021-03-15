const express = require("express");
const router = express.Router();
const { loginValidation } = require("../middleware/auth.validate");
const {
  registerManagerValidation,
} = require("../middleware/register.validate");
const jwtValidation = require("../middleware/jwt.validate");
const Manager = require("../model/Manager");
const md5 = require("md5");
const jwt = require("jsonwebtoken");

//Manager register
router.post("/register", async (req, res) => {
  const { error } = registerManagerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const manager = new Manager({
    ...req.body,
    password: md5(req.body.password),
  });
  try {
    const savedManager = await manager.save();
    res.send(savedManager);
  } catch (error) {
    res.status(400).send(error);
  }
});

//User login
router.post("/login", async (req, res) => {
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const manager = await Manager.findOne({ username: req.body.username });
  if (!manager) return res.status(400).send("Username doesn't exist!");
  if (manager.password !== md5(req.body.password))
    return res.status(400).send("Password is wrong!");
  const token = jwt.sign(
    { _id: manager._id, permission: "manager" },
    process.env.SECRET_KEY
  );
  res.status(200).header({ auth_token: token }).send(token);
});

//Query user by id

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
