const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, unique: false, trim: true },
  lastName: { type: String, required: true, unique: false, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  // Forgot you Password
  resetPasswordToken: String,
  resetPasswordExpire: Date,

});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password for login
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.getResetPassToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  // Set expire time (e.g., 15 mins)
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken;
};


module.exports = mongoose.model('Users', userSchema);
