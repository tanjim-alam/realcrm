const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/database');
const reminderService = require('./services/reminderService');
const userStatusService = require('./services/userStatusService');
const notificationService = require('./services/notificationService');
require('dotenv').config();

const app = express();

// Connect to MongoDB
connectDB();


const corsOptions = {
  origin: [
    'http://localhost:5173',  // Default Vite dev server
    'http://localhost:3000',  // Alternative React dev server
    'http://localhost:5174',
    'http://127.0.0.1:5502'
    // Your current setting
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200
};
// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/leads', require('./routes/leads'));
app.use('/api/properties', require('./routes/properties'));
app.use('/api/subscription', require('./routes/subscription'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/form-templates', require('./routes/formTemplates'));
app.use('/api/webhooks', require('./routes/webhooks'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/email-templates', require('./routes/emailTemplates'));
app.use('/api/email-campaigns', require('./routes/emailCampaigns'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/test-email', require('./routes/testEmail'));
app.use('/api/company', require('./routes/company'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/lead-scoring', require('./routes/leadScoring'));
app.use('/api/tasks', require('./routes/tasks'));
// SMS routes (optional - only load if Twilio is available)
try {
  // Check if Twilio is available before loading routes
  require('twilio');
  app.use('/api/sms', require('./routes/sms'));
  app.use('/api/sms-campaigns', require('./routes/smsCampaigns'));
  console.log('📱 SMS routes loaded successfully');
} catch (error) {
  console.log('⚠️  SMS routes not available (Twilio not installed)');
  // Create dummy routes to prevent 404 errors
  app.use('/api/sms', (req, res) => res.status(503).json({ message: 'SMS service not available' }));
  app.use('/api/sms-campaigns', (req, res) => res.status(503).json({ message: 'SMS service not available' }));
}
app.use('/api/chat', require('./routes/chat'));
app.use('/api/lead-generation', require('./routes/leadGeneration'));
app.use('/api/dashboard-builder', require('./routes/dashboardBuilder'));

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 8080;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5174',
      'http://127.0.0.1:5502'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Make io available globally
app.set('io', io);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user authentication
  socket.on('authenticate', async (data) => {
    try {
      const { token, userId, companyId } = data;
      console.log(`Authenticating user ${userId} with company ${companyId}`);

      // Join company room
      socket.join(`company-${companyId}`);
      socket.join(`user-${userId}`);

      // Set user as online
      userStatusService.setUserOnline(userId, socket.id);

      // Notify others in the company that user is online
      socket.to(`company-${companyId}`).emit('user-online', { userId });

      console.log(`User ${userId} authenticated and joined company ${companyId}`);
      console.log(`Socket ${socket.id} joined rooms: company-${companyId}, user-${userId}`);
    } catch (error) {
      console.error('Authentication error:', error);
      socket.emit('auth-error', { message: 'Authentication failed' });
    }
  });

  // Handle joining chat
  socket.on('join-chat', (chatId) => {
    socket.join(`chat-${chatId}`);
    console.log(`User joined chat: ${chatId}`);
    console.log(`Socket ${socket.id} joined room: chat-${chatId}`);
  });

  // Handle leaving chat
  socket.on('leave-chat', (chatId) => {
    socket.leave(`chat-${chatId}`);
    console.log(`User left chat: ${chatId}`);
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    socket.to(`chat-${data.chatId}`).emit('user-typing', {
      userId: data.userId,
      userName: data.userName,
      chatId: data.chatId
    });
  });

  socket.on('stop-typing', (data) => {
    socket.to(`chat-${data.chatId}`).emit('user-stop-typing', {
      userId: data.userId,
      chatId: data.chatId
    });
  });

  // Handle presence updates
  socket.on('presence-update', (data) => {
    userStatusService.setUserPresence(data.userId, data.isOnChatPage);

    // Notify others in the company
    socket.to(`company-${data.companyId}`).emit('presence-update', {
      userId: data.userId,
      isOnChatPage: data.isOnChatPage
    });
  });

  // Handle page tracking
  socket.on('page-change', (data) => {
    const { userId, companyId, currentPage } = data;

    // Store current page for user
    userStatusService.setUserPage(userId, currentPage);

    console.log(`User ${userId} is now on page: ${currentPage}`);
  });


  // Handle message delivery confirmation
  socket.on('message-delivered', (data) => {
    socket.to(`chat-${data.chatId}`).emit('message-delivered', {
      messageId: data.messageId,
      deliveredAt: new Date()
    });
  });

  // Handle message read confirmation
  socket.on('message-read', (data) => {
    socket.to(`chat-${data.chatId}`).emit('message-read', {
      messageId: data.messageId,
      readBy: data.userId,
      readAt: new Date()
    });
  });

  // Handle notification connection
  socket.on('join-notifications', (data) => {
    if (data.userId) {
      socket.userId = data.userId; // Store userId in socket object
      notificationService.addClient(data.userId, socket);
      console.log(`User ${data.userId} joined notifications`);
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    // Set user as offline
    userStatusService.setUserOffline(socket.id);

    // Remove from notification service
    notificationService.removeClient(socket.userId, socket);

    // Notify others that user is offline
    socket.broadcast.emit('user-offline', { socketId: socket.id });
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  // Start reminder service after server is running
  reminderService.start();
});
