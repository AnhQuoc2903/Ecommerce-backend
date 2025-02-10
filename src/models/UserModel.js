const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, require: true, unique: true },
    password: { type: String, require: true },
    isAdmin: { type: Boolean, default: false, require: true },
    phone: { type: String, required: true },
    // access_token: { type: String, require: true },
    // refresh_token: { type: String, require: true },
    address: { type: String },
    avatar: { type: String },
    gender: { type: String, required: true },
    dob: { type: Date },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
