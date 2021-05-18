const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);

const loginValidation = (data) => {
  const schema = Joi.object({
    username: Joi.string().min(2).max(30).required(),
    password: Joi.string().required(),
  });
  return schema.validate(data);
};

const loginValidationEmail = (data) => {
  const schema = Joi.object({
    email: Joi.string().min(2).max(30).required(),
    password: Joi.string().required(),
  });
  return schema.validate(data);
};

module.exports = {
  loginValidation,
  loginValidationEmail,
};
