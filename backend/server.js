const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/database');
const reminderService = require('./services/reminderService');
const userStatusService = require('./services/userStatusService');
const chatPresenceService = require('./services/chatPresenceService');
require('dotenv').config();

const app = express();

// Connect to MongoDB
connectDB();


const corsOptions = {
	origin: [
		'http://localhost:5173',  // Default Vite dev server
		'http://localhost:3000',  // Alternative React dev server
		'http://localhost:5174' ,
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
app.use('/api/leads', require('./routes/leads'));
app.use('/api/properties', require('./routes/properties'));
app.use('/api/subscription', require('./routes/subscription'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/form-templates', require('./routes/formTemplates'));
app.use('/api/webhooks', require('./routes/webhooks'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/email-templates', require('./routes/emailTemplates'));
app.use('/api/email-campaigns', require('./routes/emailCampaigns'));
app.use('/api/test-email', require('./routes/testEmail'));
app.use('/api/company', require('./routes/company'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/lead-scoring', require('./routes/leadScoring'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/chat', require('./routes/chat'));
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
app.use('/api/notifications', require('./routes/notifications'));

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
    methods: ['GET', 'POST']
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user authentication and status
  socket.on('user-online', (data) => {
    const { userId, companyId } = data;
    console.log('User online event received:', data);
    if (userId && companyId) {
      userStatusService.setUserOnline(userId, socket.id);
      socket.userId = userId;
      socket.companyId = companyId;
      
      // Join user to their company room
      socket.join(`company-${companyId}`);
      console.log(`User ${userId} is online and joined company ${companyId}`);
      
      // Notify other users in the company about status change
      socket.to(`company-${companyId}`).emit('user-status-changed', {
        userId,
        status: 'online',
        lastSeen: new Date()
      });
      
      // Also notify the user themselves about their own status
      socket.emit('user-status-changed', {
        userId,
        status: 'online',
        lastSeen: new Date()
      });
    }
  });

  // Join specific chat room
  socket.on('join-chat', (chatId) => {
    socket.join(`chat-${chatId}`);
    console.log(`User ${socket.id} joined chat ${chatId}`);
  });

  // Leave chat room
  socket.on('leave-chat', (chatId) => {
    socket.leave(`chat-${chatId}`);
    console.log(`User ${socket.id} left chat ${chatId}`);
  });

  // User enters chat page
  socket.on('user-on-chat-page', (data) => {
    const { userId } = data;
    if (userId && socket.userId === userId) {
      chatPresenceService.setUserOnChatPage(userId, socket.id);
      console.log(`User ${userId} is now on chat page`);
    }
  });

  // User leaves chat page (but still connected)
  socket.on('user-off-chat-page', (data) => {
    const { userId } = data;
    if (userId && socket.userId === userId) {
      chatPresenceService.setUserOffChatPage(userId);
      console.log(`User ${userId} left chat page`);
    }
  });

  // Handle new message
  socket.on('new-message', (data) => {
    // Broadcast to all users in the chat room
    socket.to(`chat-${data.chatId}`).emit('message-received', data);
  });

  // Handle typing indicator
  socket.on('typing', (data) => {
    socket.to(`chat-${data.chatId}`).emit('user-typing', {
      userId: data.userId,
      userName: data.userName,
      chatId: data.chatId
    });
  });

  // Handle stop typing
  socket.on('stop-typing', (data) => {
    socket.to(`chat-${data.chatId}`).emit('user-stop-typing', {
      userId: data.userId,
      chatId: data.chatId
    });
  });

  // Handle ping for keeping connection alive
  socket.on('ping', () => {
    if (socket.userId) {
      userStatusService.updateLastSeen(socket.userId);
    }
    socket.emit('pong');
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    if (socket.userId && socket.companyId) {
      userStatusService.setUserOffline(socket.id);
      chatPresenceService.removeUser(socket.userId);
      
      // Notify other users in the company about status change
      socket.to(`company-${socket.companyId}`).emit('user-status-changed', {
        userId: socket.userId,
        status: 'offline',
        lastSeen: new Date()
      });
      
      console.log(`User ${socket.userId} is offline`);
    }
    console.log('User disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Start reminder service after server is running
  reminderService.start();
});
