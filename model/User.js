const mongoose = require("mongoose");
<<<<<<< HEAD

=======
>>>>>>> c1fa349aacc5bdaae33df3ab4706da603a6fd415
mongoose.set("useFindAndModify", false);

const locationSchema = new mongoose.Schema({
  address: {
    type: String,
    maxlength: 150,
    default: "",
  },
  lat: {
    type: String,
    default: "",
  },
  lng: {
    type: String,
    default: "",
  },
});

const infoSchema = new mongoose.Schema({
  name: {
    type: String,
    maxlength: 30,
    default: "",
  },
  gender: {
    type: String,
    enum: ["", "male", "female"],
    default: "",
  },
  avt: {
    type: String,
    default: "",
  },
  phone: {
    type: String,
    length: 10,
    default: "",
  },
  email: {
    type: String,
    default: "",
  },
  location: {
    type: locationSchema,
    required: true,
    default: {},
  },
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    minlength: 6,
    maxlength: 30,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  info: {
    type: infoSchema,
    required: true,
    default: {},
  },
  favoriteMerchant: {
    type: [mongoose.ObjectId],
    ref: "Merchant",
  },
});

module.exports = mongoose.model("User", userSchema);
