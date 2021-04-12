const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);

const registerMerchantValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string()
      .min(6)
      .max(30)
      .required()
      .messages({ "string.empty": "Email không được để trống" }),
    password: Joi.string(),
    name: Joi.string()
      .required()
      .messages({ "string.empty": "Tên quán không được để trống" }),
    representative: Joi.object({
      name: Joi.string()
        .required()
        .messages({ "string.empty": "Tên người đại diện không được để trống" }),
      address: Joi.string().required().messages({
        "string.empty": "Đia chỉ người đại diện không được để trống",
      }),
      identity: Joi.string().min(9).max(12).required().messages({
        "string.empty": "Số CMND  người đại diện không được để trống",
        "string.min": "Số CMND không hợp lệ",
        "string.max": "Số CMND không hợp lệ",
      }),
      phone: Joi.number()
        .min(10 ** 7)
        .max(10 ** 9 - 1)
        .required()
        .messages({
          "number.empty": "Số điện thoại đại diện không được để trống",
          "number.min": "Số điện thoại người đại diện không hợp lệ",
          "number.max": "Số điện thoại người đại diện không hợp lệ",
        }),
    }).messages({ "object.base": "Thiếu thông tin người đại diện" }),
    location: Joi.object({
      address: Joi.string().max(150).required().messages({
        "string.empty": "Địa chỉ quán không được để trống",
      }),
      district: Joi.number().min(1).max(12).required(),
      lat: Joi.string().max(20).required(),
      lng: Joi.string().max(20).required(),
    }).required(),
    typeFood: Joi.number().valid(0, 1).required().messages({
      "any.only": "Loại đồ ăn không được để trống",
    }),
    dayPart: Joi.array()
      .max(3)
      .items(Joi.number().min(0).max(2).required())
      .required()
      .messages({
        "items.empty": "Thời điểm hoạt động trong ngày không được để trống",
        "array.includesRequiredUnknowns":
          "Thời điểm hoạt động trong ngày không được để trống",
      }),
    phone: Joi.number()
      .min(10 ** 7)
      .max(10 ** 9 - 1)
      .required()
      .messages({
        "number.empty": "Số điện thoại quán không được để trống",
        "number.min": "Số điện thoại quán đại diện không hợp lệ",
        "number.max": "Số điện thoại quán đại diện không hợp lệ",
      }),
    status: Joi.string().valid("open", "close", "suspend"),
    deduct: Joi.number().max(100),
    openTime: Joi.object({
      mon: Joi.object({
        label: Joi.string(),
        enable: Joi.boolean().required(),
        time: Joi.string(),
      }),
      tue: Joi.object({
        label: Joi.string().required(),
        enable: Joi.boolean().required(),
        time: Joi.string().required(),
      }),
      wed: Joi.object({
        label: Joi.string(),
        enable: Joi.boolean().required(),
        time: Joi.string(),
      }),
      thu: Joi.object({
        label: Joi.string(),
        enable: Joi.boolean().required(),
        time: Joi.string(),
      }),
      fri: Joi.object({
        label: Joi.string(),
        enable: Joi.boolean().required(),
        time: Joi.string(),
      }),
      sat: Joi.object({
        label: Joi.string(),
        enable: Joi.boolean().required(),
        time: Joi.string(),
      }),
      sun: Joi.object({
        label: Joi.string(),
        enable: Joi.boolean().required(),
        time: Joi.string(),
      }),
    }),
    avt: Joi.any(),
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
      email: Joi.string().email().min(8).max(254).lowercase().trim().required(),
    }),
  });
  return schema.validate(data);
};

const signupUserValidation = (data) => {
  const schema = Joi.object({
    username: Joi.string().min(6).max(128).trim().required(),
    password: Joi.string().max(128).trim().required(),
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
  signupUserValidation,
};
