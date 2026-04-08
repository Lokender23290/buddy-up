require('dotenv').config();

// Environment Validation (Fail Fast)
const requiredEnv = ['JWT_SECRET', 'MONGODB_URI', 'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'];
const missingEnv = requiredEnv.filter(env => !process.env[env]);

if (missingEnv.length > 0) {
  console.error(`\x1b[31mCRITICAL ERROR: Missing environment variables: ${missingEnv.join(', ')}\x1b[0m`);
  console.error('Application termination due to incomplete security configuration.');
  process.exit(1);
}

const express = require('express');

const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/error');

const authRoutes = require('./routes/auth');
const walletRoutes = require('./routes/wallet');
const messageRoutes = require('./routes/message');
const postRoutes = require('./routes/post');

const app = express();

// High-Priority Request Audit Logger
app.use((req, res, next) => {
  console.log(`[VAULT HANDSHAKE] ${req.method} ${req.url}`);
  next();
});

// Security Headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Sanitize data (Prevent NoSQL injection)
app.use(mongoSanitize());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // Dramatically increased for dev polling
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

app.use(express.json());

// Request Audit Logger
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  next();
});

// Simplified Identity Sync CORS
app.use(cors({
  origin: true,
  credentials: true,
}));

app.get('/api/health', (req, res) => {
  res.json({ message: 'Backend is running and secured' });
});

app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/posts', postRoutes);

// Global Error Handler (MUST BE LAST)
app.use(errorHandler);

const http = require('http');
const { initSocket } = require('./utils/socket');

const server = http.createServer(app);
const io = initSocket(server);

// Attach io to request for use in controllers if needed
app.set('io', io);

const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/auth_db';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on 0.0.0.0:${PORT} for network access`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
