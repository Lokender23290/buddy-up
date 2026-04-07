const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  identifier: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['email', 'phone'],
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + ((Number(process.env.OTP_EXPIRY) || 10) * 60 * 1000)),
    index: { expires: 0 },
  },
  attempts: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model('OTP', otpSchema);
