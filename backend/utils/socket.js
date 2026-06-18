const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');

const userSocketMap = new Map(); // userId -> socketId

const initSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL 
        ? [process.env.FRONTEND_URL, "http://localhost:3000", "http://localhost:5173"] 
        : (origin, callback) => callback(null, true),
      methods: ["GET", "POST"]
    }
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication failed: Token missing'));
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Authentication failed: Invalid credentials'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.userId;
    userSocketMap.set(userId, socket.id);
    
    // Identity Node online status synchronization
    const currentlyOnline = Array.from(userSocketMap.keys());
    socket.emit('initial_online_users', currentlyOnline);

    await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: Date.now() });
    io.emit('user_status_change', { userId, isOnline: true });

    console.log(`Node linked: Authority ${userId} connected.`);

    // Real-time Chat Sync Sequence
    socket.on('send_message', async ({ receiverId, content }) => {
        console.log(`[MSG DISPATCH] From ${userId} to ${receiverId}: ${content.substring(0, 20)}...`);
        try {
            const receiverSocketId = userSocketMap.get(receiverId);
            const status = receiverSocketId ? 'delivered' : 'sent';
            console.log(`[MSG STATUS] Recipient ${receiverId} is ${receiverSocketId ? 'ONLINE' : 'OFFLINE'}. Status: ${status}`);
            
            const message = await Message.create({
                sender: userId,
                receiver: receiverId,
                content,
                status
            });

            const messageData = await message.populate('sender', 'name');
            
            // Push to sender for confirmation
            socket.emit('message_received', messageData);

            if (receiverSocketId) {
                // Real-time bypass to recipient
                io.to(receiverSocketId).emit('new_message', messageData);
            }
        } catch (error) {
            console.error('Message sync failure:', error);
        }
    });

    // Typing Authority Signal
    socket.on('typing_start', ({ receiverId }) => {
        const receiverSocketId = userSocketMap.get(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('user_typing', { userId });
        }
    });

    socket.on('typing_stop', ({ receiverId }) => {
        const receiverSocketId = userSocketMap.get(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('user_stopped_typing', { userId });
        }
    });

    // Read Receipt Execution
    socket.on('mark_read', async ({ messageIds, senderId }) => {
        try {
            await Message.updateMany(
                { _id: { $in: messageIds }, status: { $ne: 'read' } },
                { status: 'read' }
            );

            const senderSocketId = userSocketMap.get(senderId);
            if (senderSocketId) {
                io.to(senderSocketId).emit('messages_read', { messageIds, readerId: userId });
            }
        } catch (error) {
            console.error('Read receipt sync failure:', error);
        }
    });

    socket.on('disconnect', async () => {
      userSocketMap.delete(userId);
      await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: Date.now() });
      socket.broadcast.emit('user_status_change', { userId, isOnline: false });
      console.log(`Node detached: Authority ${userId} disconnected.`);
    });
  });

  return io;
};

module.exports = { initSocket, userSocketMap };
