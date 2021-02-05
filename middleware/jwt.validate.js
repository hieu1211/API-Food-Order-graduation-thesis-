const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  try {
    const payload = jwt.verify(
      req.header("auth_token"),
      process.env.SECRET_KEY
    );
    req._id = payload._id;
    req.permission = payload.permission;
    next();
  } catch (error) {
    next();
  }
};
