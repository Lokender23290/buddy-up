const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { verifyToken } = require('../middleware/auth');

// Protected Routes: Only for verified campus identities
router.post('/send', verifyToken, messageController.sendMessage);
router.get('/chat/:userId', verifyToken, messageController.getChat);
router.get('/conversations', verifyToken, messageController.getConversations);

module.exports = router;
