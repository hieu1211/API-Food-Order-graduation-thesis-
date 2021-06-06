const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  try {
    if (req.header("auth_token")) {
      const payload = jwt.verify(
        req.header("auth_token"),
        process.env.SECRET_KEY
      );
      req._id = payload._id;
      req.permission = payload.permission;
    }
    console.log("next");
    next();
  } catch (error) {
    res.status(401).send("Unauthorized!");
  }
};
