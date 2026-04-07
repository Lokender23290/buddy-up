const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

router.post('/signup', authController.signup);
router.post('/google', authController.googleAuth);
router.post('/login', authController.login);
router.post('/send-email-otp', authController.sendEmailOTP);
router.post('/send-phone-otp', authController.sendPhoneOTP);
router.post('/verify-otp', authController.verifyOTP);
router.get('/current-user', verifyToken, authController.getCurrentUser);
router.get('/users', verifyToken, authController.getAllUsers);
router.put('/profile', verifyToken, authController.updateProfile);
router.post('/connect/:id', verifyToken, authController.sendRequest);
router.post('/accept/:id', verifyToken, authController.acceptRequest);
router.post('/reject/:id', verifyToken, authController.rejectRequest);
router.get('/connections', verifyToken, authController.getConnections);
router.get('/user/:id', verifyToken, authController.getUserById);

module.exports = router;
