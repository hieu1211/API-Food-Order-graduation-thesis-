const mongoose = require("mongoose");

<<<<<<< HEAD
mongoose.set("useFindAndModify", false);

=======
>>>>>>> 1ca8383096753430d44ab4bbab014d35dd33aa77
const locationSchema = new mongoose.Schema({
  address: {
    type: String,
    maxlength: 150,
<<<<<<< HEAD
    default: "",
  },
  lat: {
    type: String,
    default: "",
  },
  lng: {
    type: String,
    default: "",
=======
    required: true,
  },
  lat: {
    type: String,
    required: true,
  },
  lng: {
    type: String,
    required: true,
>>>>>>> 1ca8383096753430d44ab4bbab014d35dd33aa77
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
<<<<<<< HEAD
    required: true,
    default: {},
=======
>>>>>>> 1ca8383096753430d44ab4bbab014d35dd33aa77
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
