const crypto = require("crypto");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    salt: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

userSchema.methods.setPassword = function setPassword(password) {
  this.salt = crypto.randomBytes(16).toString("hex");
  this.passwordHash = crypto.scryptSync(password, this.salt, 64).toString("hex");
};

userSchema.methods.validatePassword = function validatePassword(password) {
  const hash = crypto.scryptSync(password, this.salt, 64);
  const storedHash = Buffer.from(this.passwordHash, "hex");

  return storedHash.length === hash.length && crypto.timingSafeEqual(storedHash, hash);
};

module.exports = mongoose.model("User", userSchema);
