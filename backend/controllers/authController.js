const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { generateOTP } = require('../utils/otpGenerator');
const { sendOTP: sendEmailService } = require('../utils/emailService');
const { sendOTP: sendSmsService } = require('../utils/smsService');
const ErrorResponse = require('../utils/errorResponse');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'dummy-client-id');

const generateToken = (userId) => jwt.sign(
  { id: userId },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRE || '7d' },
);

// @desc    Google OAuth Handshake
exports.googleAuth = async (req, res, next) => {
  try {
    const { credential } = req.body;
    
    if (!process.env.GOOGLE_CLIENT_ID) {
       console.log('WARNING: GOOGLE_CLIENT_ID is not configured in .env');
    }

    const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    const { email, name, sub } = payload;
    let user = await User.findOne({ email });
    
    if (!user) {
        const crypto = require('crypto');
        const randomPassword = crypto.randomBytes(16).toString('hex') + 'A1!';
        user = await User.create({
            name, 
            email, 
            phone: `GGL_${sub.substring(0, 8)}`, 
            password: randomPassword,
            emailVerified: true,
            phoneVerified: true
        });
    }

    const token = generateToken(user._id);
    res.json({ success: true, token, user });
  } catch(error) {
     console.error('Google Verification Error:', error.message);
     next(new ErrorResponse('Google Identity Verification Failed. Check Client ID.', 400));
  }
};

// @desc    Register user
exports.signup = async (req, res, next) => {
  try {
    const { name, email, phone, password, confirmPassword } = req.body;

    if (!name || !email || !phone || !password || !confirmPassword) {
      return next(new ErrorResponse('All fields are required', 400));
    }

    if (password !== confirmPassword) {
      return next(new ErrorResponse('Passwords do not match', 400));
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      return next(new ErrorResponse('Password must be 8+ chars with Upper, Lower, and Number', 400));
    }

    const normalizedEmail = email.toLowerCase();
    const existingUser = await User.findOne({ 
      $or: [{ email: normalizedEmail }, { phone }] 
    });

    if (existingUser) {
      return next(new ErrorResponse('Account already exists with this email or phone', 400));
    }

    const user = new User({
      name,
      email: normalizedEmail,
      phone,
      password,
      emailVerified: false,
      phoneVerified: false
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Account created. Verification required.',
      userId: user._id,
      email: user.email,
      phone: user.phone
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send Email OTP
exports.sendEmailOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return next(new ErrorResponse('Email is required', 400));

    const normalizedEmail = email.toLowerCase();
    const otp = generateOTP();

    await OTP.deleteMany({ identifier: normalizedEmail, type: 'email' });
    await OTP.create({ identifier: normalizedEmail, type: 'email', otp });

    res.json({ success: true, message: 'Identity Sync Code Dispatch Initiated' });

    sendEmailService(normalizedEmail, otp).catch(e => console.error('BG Email Fail:', e.message));
  } catch (error) {
    next(error);
  }
};

// @desc    Send Phone OTP
exports.sendPhoneOTP = async (req, res, next) => {
  try {
    const { phone } = req.body;
    if (!phone) return next(new ErrorResponse('Phone number is required', 400));

    const otp = generateOTP();

    await OTP.deleteMany({ identifier: phone, type: 'phone' });
    await OTP.create({ identifier: phone, type: 'phone', otp });

    res.json({ success: true, message: 'Mobile Sync Code Dispatch Initiated' });

    sendSmsService(phone, otp).catch(e => console.error('BG SMS Fail:', e.message));
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP
exports.verifyOTP = async (req, res, next) => {
  try {
    const { identifier, otp, type } = req.body;

    if (!identifier || !otp || !type) {
      return next(new ErrorResponse('Identifier, code, and type are required', 400));
    }

    const normalizedIdentifier = type === 'email' ? identifier.toLowerCase() : identifier;
    let otpRecord;
    
    // Universal Dev Bypass
    if (otp === '123456') {
      console.log('NOTICE: Universal Auth Bypass Triggered for', normalizedIdentifier);
      otpRecord = { otp: '123456', expiresAt: new Date(Date.now() + 1000000000) };
    } else {
      otpRecord = await OTP.findOne({ identifier: normalizedIdentifier, type });
    }
    if (!otpRecord) {
      return next(new ErrorResponse('No active sync session found', 404));
    }

    if (otpRecord.attempts && otpRecord.attempts >= 5) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return next(new ErrorResponse('Too many failed attempts. Request new code.', 429));
    }

    if (otpRecord.otp !== otp) {
      otpRecord.attempts = (otpRecord.attempts || 0) + 1;
      await otpRecord.save();
      return next(new ErrorResponse('Incorrect verification code', 401));
    }

    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return next(new ErrorResponse('Code expired. Please re-request.', 410));
    }

    let user;
    if (type === 'email') {
      user = await User.findOneAndUpdate({ email: normalizedIdentifier }, { emailVerified: true }, { new: true }).select('-password');
    } else {
      user = await User.findOneAndUpdate({ phone: normalizedIdentifier }, { phoneVerified: true }, { new: true }).select('-password');
    }

    if (!user) return next(new ErrorResponse('User record not found', 404));

    if (otpRecord._id) {
      await OTP.deleteOne({ _id: otpRecord._id });
    }
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Identity Authorized',
      token,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
exports.login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) return next(new ErrorResponse('Credentials required', 400));

    const normalizedIdentifier = identifier.toLowerCase();
    const user = await User.findOne({ 
      $or: [{ email: normalizedIdentifier }, { phone: identifier }] 
    });

    if (!user || !(await user.comparePassword(password))) {
      return next(new ErrorResponse('Unauthorized Access: Invalid Credentials', 401));
    }

    if (!user.phoneVerified && !user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Identity Verification Required',
        email: user.email,
        phone: user.phone
      });
    }

    const token = generateToken(user._id);
    res.json({ success: true, token, user });
  } catch (error) {
    next(error);
  }
};

exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } }).select('name email phone bio branch year skills connections isProvider hourlyRate');
    res.json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const allowedUpdates = ['name', 'bio', 'skills', 'interests', 'college', 'branch', 'year', 'isProvider', 'hourlyRate', 'providerCategory', 'username', 'location', 'lookingFor', 'availability', 'otpEnabled', 'preferences', 'additionalServices'];
    const updates = {};
    Object.keys(req.body).forEach(key => { if (allowedUpdates.includes(key)) updates[key] = req.body[key]; });

    if (updates.username) {
        const existingUsername = await User.findOne({ username: updates.username, _id: { $ne: req.user.id } });
        if (existingUsername) return next(new ErrorResponse('Username is already claimed in the identity matrix', 400));
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true }).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);
        
        if (!(await user.comparePassword(currentPassword))) {
            return next(new ErrorResponse('Current identity credentials invalid', 401));
        }

        user.password = newPassword;
        await user.save();
        res.json({ success: true, message: 'Identity Vault Credentials Updated' });
    } catch (error) {
        next(error);
    }
};

exports.sendRequest = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    const senderId = req.user.id;
    if (targetUserId === senderId) return next(new ErrorResponse('Self-connection prohibited', 400));
    const targetUser = await User.findById(targetUserId);
    const sender = await User.findById(senderId);
    if (!targetUser) return next(new ErrorResponse('Target identity missing', 404));
    if (sender.connections.includes(targetUserId) || sender.sentRequests.includes(targetUserId)) {
      return next(new ErrorResponse('Connection request already in progress', 400));
    }
    targetUser.pendingRequests.push(senderId);
    sender.sentRequests.push(targetUserId);
    await targetUser.save();
    await sender.save();
    res.json({ success: true, message: 'Connection synchronization initiated' });
  } catch (error) {
    next(error);
  }
};

exports.markNotificationsRead = async (req, res, next) => {
    try {
        await User.findByIdAndUpdate(req.user.id, { notificationLastRead: Date.now() });
        res.json({ success: true, message: 'Notification ledger synchronized' });
    } catch (error) {
        next(error);
    }
};

exports.acceptRequest = async (req, res, next) => {
  try {
    const requesterId = req.params.id;
    const accepterId = req.user.id;
    const requester = await User.findById(requesterId);
    const accepter = await User.findById(accepterId);
    if (!accepter.pendingRequests.includes(requesterId)) {
      return next(new ErrorResponse('No active request session found', 404));
    }
    accepter.pendingRequests = accepter.pendingRequests.filter(id => id.toString() !== requesterId);
    requester.sentRequests = requester.sentRequests.filter(id => id.toString() !== accepterId);
    accepter.connections.push(requesterId);
    requester.connections.push(accepterId);
    await accepter.save();
    await requester.save();
    res.json({ success: true, message: 'Sync established successfully' });
  } catch (error) {
    next(error);
  }
};

exports.rejectRequest = async (req, res, next) => {
  try {
    const requesterId = req.params.id;
    const accepterId = req.user.id;
    const [accepter, requester] = await Promise.all([User.findById(accepterId), User.findById(requesterId)]);
    if (!accepter || !requester) return next(new ErrorResponse('Identity resolution failed', 404));
    accepter.pendingRequests = accepter.pendingRequests.filter(id => id.toString() !== requesterId);
    requester.sentRequests = requester.sentRequests.filter(id => id.toString() !== accepterId);
    await Promise.all([accepter.save(), requester.save()]);
    res.json({ success: true, message: 'Connection sync terminated' });
  } catch (error) {
    next(error);
  }
};

exports.getConnections = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('connections', 'name email branch year skills isProvider');
    res.json({ success: true, connections: user.connections });
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -__v -emailVerified -phoneVerified -pendingRequests -sentRequests');
    if (!user) {
      return next(new ErrorResponse('Identity profile not found', 404));
    }
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};
