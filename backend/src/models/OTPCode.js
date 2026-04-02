const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  type: { type: String, enum: ['verifyEmail', 'resetPassword'], required: true },
  expiresAt: { type: Date, required: true },
  isUsed: { type: Boolean, default: false }
}, { timestamps: true });

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OTPCode', otpSchema);
