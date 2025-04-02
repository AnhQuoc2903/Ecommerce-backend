const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, require: true, unique: true },
    password: { type: String, require: true },
    isAdmin: { type: Boolean, default: false, require: true },
    isBlocked: { type: Boolean, default: false },
    phone: { type: String },
    // access_token: { type: String, require: true },
    // refresh_token: { type: String, require: true },
    address: { type: String },
    avatar: { type: String },
    gender: { type: String },
    dob: { type: Date },
    city: { type: String, require: true },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
