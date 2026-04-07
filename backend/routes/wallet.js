const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { verifyToken } = require('../middleware/auth');

router.get('/info', verifyToken, walletController.getWalletInfo);
router.post('/order', verifyToken, walletController.createRazorpayOrder);
router.post('/verify', verifyToken, walletController.verifyRazorpayPayment);
router.post('/bank/authorize', verifyToken, walletController.authorizeBank);

module.exports = router;
