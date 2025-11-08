require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

// Import routes
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/uploads');
const searchRoutes = require('./routes/search');
const threadRoutes = require('./routes/threads');
const reflectionRoutes = require('./routes/reflections');
const reminderRoutes = require('./routes/reminders');
const qrRoutes = require('./routes/qr');

// Import reminder trigger function
const { triggerReminder } = require('./controllers/reminderController');
const Reminder = require('./models/Reminder');

const app = express();
const server = http.createServer(app);

// Socket.io setup with CORS
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  }
});

// Store io instance in app for use in controllers
app.set('io', io);

// Socket.io authentication and connection
io.on('connection', (socket) => {
  console.log('📱 New socket connection:', socket.id);

  // Join user-specific room
  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`✅ User ${userId} joined room: user-${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('❌ Socket disconnected:', socket.id);
  });
});

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests from frontend, mobile, and browser extensions
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://localhost:5173',
      'http://localhost:5000'
    ];

    // Allow Chrome/Firefox extensions (they send origin as chrome-extension://... or moz-extension://...)
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('chrome-extension://') || origin.startsWith('moz-extension://')) {
      callback(null, true);
    } else {
      callback(null, true); // For development, allow all origins
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/threads', threadRoutes);
app.use('/api/reflections', reflectionRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/qr', qrRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SynapseMind API is running' });
});

// MongoDB connection
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('ERROR: MONGODB_URI is not defined in .env file');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Cron job to check reminders every hour
cron.schedule('0 * * * *', async () => {
  console.log('Checking for reminders to trigger...');

  try {
    const now = new Date();
    const reminders = await Reminder.find({
      reminderDate: { $lte: now },
      isTriggered: false
    });

    for (const reminder of reminders) {
      await triggerReminder(reminder._id);
      console.log(`Triggered reminder ${reminder._id}`);
    }

    if (reminders.length > 0) {
      console.log(`Triggered ${reminders.length} reminders`);
    }
  } catch (error) {
    console.error('Cron job error:', error);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      details: err.message
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID format'
    });
  }

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════╗
║                                               ║
║         SynapseMind Backend Server            ║
║                                               ║
║  🚀 Server running on port ${PORT}              ║
║  🌐 http://localhost:${PORT}                    ║
║  📊 API: http://localhost:${PORT}/api           ║
║  📱 WebSocket: Connected                       ║
║                                               ║
╚═══════════════════════════════════════════════╝
    `);

    if (!process.env.CLAUDE_API_KEY) {
      console.log('ℹ️  Claude AI: Not configured (AI features will use defaults)');
    } else if (!process.env.CLAUDE_API_KEY.startsWith('sk-')) {
      console.log('ℹ️  Claude AI: Key format invalid (AI features will use defaults)');
    } else {
      console.log('✅ Claude AI: Configured successfully');
    }
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  mongoose.connection.close();
  process.exit(0);
});

module.exports = app;
