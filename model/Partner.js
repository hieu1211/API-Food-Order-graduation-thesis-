const mongoose = require("mongoose");
const md5 = require("md5");

const settingSchema = new mongoose.Schema({
  radiusWorking: {
    type: Number,
    required: true,
    default: 2000,
  },
});

const identitySchema = new mongoose.Schema({
  number: {
    type: String,
    required: true,
  },
  fontImg: {
    type: String,
    required: true,
  },
  backImg: {
    type: String,
    required: true,
  },
});

const partnerSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    validate: {
      validator: async function (email) {
        const user = await this.constructor.findOne({ email });
        if (user) {
          if (this.id === user.id) {
            return true;
          }
          return false;
        }
        return true;
      },
      message: (props) => "The specified email address is already in use.",
    },
    minlength: 6,
    maxlength: 30,
    required: true,
  },
  password: {
    type: String,
    required: true,
    default: md5("123"),
  },
  name: {
    type: String,
    required: true,
    maxlength: 30,
  },
  identity: {
    type: identitySchema,
    require: true,
  },
  address: {
    type: String,
    require: true,
    maxlength: 50,
  },
  gender: {
    type: String,
    enum: ["male", "female"],
    required: true,
  },
  avt: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    length: 10,
    required: true,
  },
  dateCreate: {
    type: String,
    default: Date.now,
  },
  setting: {
    type: settingSchema,
    require: true,
  },
  contract: {
    type: String,
  },
});

const infoSchema = new mongoose.Schema({});

module.exports = mongoose.model("Partner", partnerSchema);
