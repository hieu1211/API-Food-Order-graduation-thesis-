const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);

const registerMerchantValidation = (data) => {
  const schema = Joi.object({
    username: Joi.string().min(6).max(30).required(),
    password: Joi.string().required(),
    name: Joi.string().required(),
    representative: Joi.object({
      name: Joi.string().required(),
      address: Joi.string().required(),
      identity: Joi.string().min(9).max(12).required(),
      phone: Joi.number()
        .min(10 ** 7)
        .max(10 ** 9 - 1)
        .required(),
    }),
    location: Joi.object({
      address: Joi.string().max(150).required(),
      ward: Joi.string().max(20).required(),
      district: Joi.string().max(20).required(),
    }).required(),
    openTime: Joi.array().items(Joi.string().max(4).required()).required(),
    avt: Joi.string(),
    // foods:Joi.array().items(Joi.object({
    //     name:Joi.string().min(2).max(50).required(),
    //     price:Joi.number().min(10**3).max(10**8-1).required,
    //     catId:Joi.objectId().required(),

    // })),
    // category:Joi.array().items(Joi.object({
    //     name:Joi.string().max(50).required(),
    // }))
    category: Joi.array().items(
      Joi.object({
        name: Joi.string().max(50).required(),
        foods: Joi.array().items(
          Joi.object({
            name: Joi.string().max(50).required(),
            price: Joi.number()
              .max(10 ** 7)
              .required(),
          })
        ),
      })
    ),
  });
  return schema.validate(data);
};

const registerUserValidation = (data) => {
  const schema = Joi.object({
    username: Joi.string().min(6).max(30).required(),
    password: Joi.string().required(),
    info: Joi.object({
      name: Joi.string().max(30).required(),
      gender: Joi.string().valid("male", "female").required(),
      avt: Joi.string().required(),
      phone: Joi.number()
        .min(10 ** 7)
        .max(10 ** 9 - 1)
        .required(),
    }).required(),
  });
  return schema.validate(data);
};

const registerManagerValidation = (data) => {
  const schema = Joi.object({
    username: Joi.string().min(2).max(30).required(),
    password: Joi.string().required(),
  });
  return schema.validate(data);
};

module.exports = {
  registerMerchantValidation,
  registerUserValidation,
  registerManagerValidation,
};
