const Message = require('../models/Message');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Send Message
// @route   POST /api/messages/send
exports.sendMessage = async (req, res, next) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user.id;

    if (!receiverId || !content) {
      return next(new ErrorResponse('Identity recipient or payload missing', 400));
    }

    // Verify Connection Handshake
    const sender = await User.findById(senderId);
    if (!sender.connections.includes(receiverId)) {
      return next(new ErrorResponse('Sync Required: Recipient is not a verified buddy', 403));
    }

    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content
    });

    res.status(201).json({ success: true, message });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Chat History
// @route   GET /api/messages/chat/:userId
exports.getChat = async (req, res, next) => {
  try {
    const targetUserId = req.params.userId;
    const myId = req.user.id;

    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: targetUserId },
        { sender: targetUserId, receiver: myId }
      ]
    }).sort({ createdAt: 1 });

    res.json({ success: true, messages });
  } catch (error) {
    next(error);
  }
};

// @desc    Get All Active Conversations
// @route   GET /api/messages/conversations
exports.getConversations = async (req, res, next) => {
  try {
    const myId = req.user.id;

    // Fetch the current user and populate their established connections
    const user = await User.findById(myId).populate('connections', 'name email branch year skills isProvider');

    if (!user) {
      return next(new ErrorResponse('Identity profile not found', 404));
    }

    res.json({ success: true, conversations: user.connections });
  } catch (error) {
    next(error);
  }
};
