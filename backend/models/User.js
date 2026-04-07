const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  phoneVerified: {
    type: Boolean,
    default: false,
  },
  profilePhoto: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    default: '',
  },
  skills: [{
    type: String,
  }],
  interests: [{
    type: String,
  }],
  college: {
    type: String,
    trim: true,
  },
  branch: {
    type: String,
    trim: true,
  },
  year: {
    type: String,
    trim: true,
  },
  connections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  pendingRequests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  sentRequests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  isProvider: {
    type: Boolean,
    default: false,
  },
  hourlyRate: {
    type: Number,
    default: 0,
  },
  providerCategory: {
    type: String,
    default: '',
  },
  walletBalance: {
    type: Number,
    default: 0,
  },
  bankDetails: {
    holderName: { type: String, trim: true, default: '' },
    accountNumber: { type: String, trim: true, default: '' },
    ifscCode: { type: String, trim: true, default: '' },
    bankName: { type: String, trim: true, default: '' },
    isAuthorized: { type: Boolean, default: false },
    authorizedAt: { type: Date }
  }
}, { timestamps: true });

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  return next();
});

userSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
