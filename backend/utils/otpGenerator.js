const crypto = require('crypto');

/**
 * Generates a cryptographically secure 6-digit OTP.
 * Replaces insecure Math.random() for production-grade identity synchronization.
 */
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

module.exports = { generateOTP };
