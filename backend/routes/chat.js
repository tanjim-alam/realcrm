const express = require('express');
const { body, validationResult } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification');
const userStatusService = require('../services/userStatusService');
const chatPresenceService = require('../services/chatPresenceService');

const router = express.Router();

// @route   GET /api/chat/conversations
// @desc    Get all conversations for user
// @access  Private
router.get('/conversations', authMiddleware, async (req, res) => {
  try {
    console.log('Getting conversations for user:', req.user.id, 'company:', req.user.companyId);
    const conversations = await Chat.getUserChats(req.user.id, req.user.companyId);
    console.log('Found conversations:', conversations.length);
    
    // Calculate unread count for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (chat) => {
        const unreadCount = await Message.countDocuments({
          chatId: chat._id,
          isDeleted: false,
          sender: { $ne: req.user.id }, // Exclude messages sent by the user
          'readBy.user': { $ne: req.user.id }
        });
        
        return {
          ...chat.toObject(),
          unreadCount
        };
      })
    );

    console.log('Returning conversations with unread counts:', conversationsWithUnread.length);
    res.json(conversationsWithUnread);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/chat/conversations/:id
// @desc    Get single conversation
// @access  Private
router.get('/conversations/:id', authMiddleware, async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      companyId: req.user.companyId,
      'participants.user': req.user.id
    })
    .populate('participants.user', 'name email')
    .populate('createdBy', 'name email')
    .populate('lastMessage.sentBy', 'name email');

    if (!chat) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Update last read time
    await chat.updateLastRead(req.user.id);

    res.json(chat);
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/chat/conversations
// @desc    Create new conversation
// @access  Private
router.post('/conversations', [
  body('name').notEmpty().withMessage('Name is required'),
  body('type').isIn(['direct', 'group', 'channel']).withMessage('Invalid conversation type'),
  body('participants').isArray().withMessage('Participants must be an array')
], authMiddleware, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, type, participants, description } = req.body;

    // Validate participants
    const participantIds = [...new Set(participants)]; // Remove duplicates
    const users = await User.find({
      _id: { $in: participantIds },
      companyId: req.user.companyId
    });

    if (users.length !== participantIds.length) {
      return res.status(400).json({ message: 'Some participants not found' });
    }

    // Add creator to participants if not already included
    if (!participantIds.includes(req.user.id.toString())) {
      participantIds.push(req.user.id);
    }

    const chat = new Chat({
      companyId: req.user.companyId,
      name,
      type,
      description,
      participants: participantIds.map(id => ({ user: id })),
      createdBy: req.user.id
    });

    await chat.save();

    // Populate the chat
    await chat.populate([
      { path: 'participants.user', select: 'name email' },
      { path: 'createdBy', select: 'name email' }
    ]);

    res.status(201).json(chat);
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/chat/conversations/direct
// @desc    Get or create direct conversation with user
// @access  Private
router.post('/conversations/direct', [
  body('userId').isMongoId().withMessage('Valid user ID is required')
], authMiddleware, async (req, res) => {
  try {
    console.log('Direct chat creation request:', { userId: req.body.userId, requester: req.user.id, company: req.user.companyId });
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId } = req.body;

    // Verify user exists and belongs to same company
    const user = await User.findOne({
      _id: userId,
      companyId: req.user.companyId
    });

    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User found, creating/getting chat...');
    const chat = await Chat.getOrCreateDirectChat(req.user.id, userId, req.user.companyId);

    // Populate the chat
    await chat.populate([
      { path: 'participants.user', select: 'name email' },
      { path: 'createdBy', select: 'name email' }
    ]);

    console.log('Direct chat created/retrieved successfully:', chat._id);
    
    // Emit conversation created event to all participants
    const io = req.app.get('io');
    if (io) {
      chat.participants.forEach(participant => {
        io.to(`company-${req.user.companyId}`).emit('conversation-created', chat);
      });
    }
    
    res.json(chat);
  } catch (error) {
    console.error('Get or create direct conversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/chat/conversations/:id/messages
// @desc    Get messages for conversation
// @access  Private
router.get('/conversations/:id/messages', authMiddleware, async (req, res) => {
  try {
    console.log('Fetching messages for chat:', req.params.id, 'by user:', req.user.id);
    const { page = 1, limit = 50 } = req.query;
    
    // Verify user has access to this conversation
    const chat = await Chat.findOne({
      _id: req.params.id,
      companyId: req.user.companyId,
      'participants.user': req.user.id
    });

    console.log('Chat found:', !!chat);
    if (!chat) {
      console.log('Chat not found or user not authorized');
      return res.status(404).json({ message: 'Conversation not found' });
    }

    console.log('Getting messages...');
    const messages = await Message.getChatMessages(req.params.id, parseInt(page), parseInt(limit));
    console.log('Messages found:', messages.length);
    
    // Mark messages as read (only for messages not sent by the user)
    await Message.updateMany(
      {
        chatId: req.params.id,
        sender: { $ne: req.user.id }, // Don't mark own messages as read
        'readBy.user': { $ne: req.user.id }
      },
      {
        $push: { readBy: { user: req.user.id, readAt: new Date() } }
      }
    );

    // Update chat's last read time
    await chat.updateLastRead(req.user.id);

    // Emit unread count update to all users in the company
    const io = req.app.get('io');
    if (io) {
      io.to(`company-${req.user.companyId}`).emit('unread-count-updated');
    }

    res.json(messages.reverse()); // Return in chronological order
  } catch (error) {
    console.error('Get messages error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      chatId: req.params.id,
      userId: req.user.id
    });
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/chat/conversations/:id/messages
// @desc    Send message to conversation
// @access  Private
router.post('/conversations/:id/messages', [
  body('content').notEmpty().withMessage('Message content is required'),
  body('type').optional().isIn(['text', 'image', 'file', 'emoji']).withMessage('Invalid message type')
], authMiddleware, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verify user has access to this conversation
    const chat = await Chat.findOne({
      _id: req.params.id,
      companyId: req.user.companyId,
      'participants.user': req.user.id
    });

    if (!chat) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const { content, type = 'text', replyTo, file } = req.body;

    const message = new Message({
      chatId: req.params.id,
      companyId: req.user.companyId,
      sender: req.user.id,
      content,
      type,
      replyTo,
      file
    });

    await message.save();

    // Update chat's last message
    chat.lastMessage = {
      content: content,
      sentBy: req.user.id,
      sentAt: new Date(),
      type: type
    };
    await chat.save();

    // Populate the message
    await message.populate([
      { path: 'sender', select: 'name email' },
      { path: 'replyTo', select: 'content sender' },
      { path: 'replyTo.sender', select: 'name email' }
    ]);

    // Emit conversation updated event
    const io2 = req.app.get('io');
    if (io2) {
      // Populate chat for the event
      await chat.populate([
        { path: 'participants.user', select: 'name email' },
        { path: 'createdBy', select: 'name email' },
        { path: 'lastMessage.sentBy', select: 'name email' }
      ]);
      
      io2.to(`company-${req.user.companyId}`).emit('conversation-updated', chat);
    }

    // Create notifications for users who are not on chat page
    try {
      const participantIds = chat.participants
        .map(p => p.user.toString())
        .filter(id => id !== req.user.id); // Exclude sender

      // Get users who are not currently on chat page
      const usersNotOnChatPage = chatPresenceService.getUsersNotOnChatPage(participantIds);
      
      if (usersNotOnChatPage.length > 0) {
        console.log(`Creating notifications for ${usersNotOnChatPage.length} users not on chat page`);
        
        // Create notifications for each user not on chat page
        const notifications = usersNotOnChatPage.map(recipientId => ({
          recipient: recipientId,
          sender: req.user.id,
          type: 'message',
          title: `New message from ${req.user.name}`,
          message: content.length > 50 ? content.substring(0, 50) + '...' : content,
          chatId: req.params.id,
          messageId: message._id,
          companyId: req.user.companyId
        }));

        await Notification.insertMany(notifications);
        console.log(`Created ${notifications.length} notifications`);
      }
    } catch (notificationError) {
      console.error('Error creating notifications:', notificationError);
      // Don't fail the message sending if notifications fail
    }

    // Emit Socket.IO event for real-time messaging
    const io3 = req.app.get('io');
    if (io3) {
      // Send message to all users in the chat room
      io3.to(`chat-${req.params.id}`).emit('message-received', {
        message: message,
        chatId: req.params.id,
        senderId: req.user.id // Include sender ID for frontend filtering
      });
      
      // Notify all users in the company about unread count update
      io3.to(`company-${req.user.companyId}`).emit('unread-count-updated');
      
      // Emit notification update to users who received notifications
      const participantIds = chat.participants
        .map(p => p.user.toString())
        .filter(id => id !== req.user.id);
      const usersNotOnChatPage = chatPresenceService.getUsersNotOnChatPage(participantIds);
      
      console.log('Users not on chat page:', usersNotOnChatPage);
      console.log('Company ID for notification:', req.user.companyId);
      
      if (usersNotOnChatPage.length > 0) {
        console.log('Emitting new-notification event to company room:', `company-${req.user.companyId}`);
        io3.to(`company-${req.user.companyId}`).emit('new-notification', {
          message: 'You have a new message',
          chatId: req.params.id,
          senderName: req.user.name
        });
        console.log('new-notification event emitted successfully');
      } else {
        console.log('No users to notify - all participants are on chat page');
      }
    }

    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/chat/messages/:id
// @desc    Edit message
// @access  Private
router.put('/messages/:id', [
  body('content').notEmpty().withMessage('Message content is required')
], authMiddleware, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const message = await Message.findOne({
      _id: req.params.id,
      sender: req.user.id,
      isDeleted: false
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    message.content = req.body.content;
    message.isEdited = true;
    message.editedAt = new Date();

    await message.save();

    res.json(message);
  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/chat/messages/:id
// @desc    Delete message
// @access  Private
router.delete('/messages/:id', authMiddleware, async (req, res) => {
  try {
    const message = await Message.findOne({
      _id: req.params.id,
      sender: req.user.id,
      isDeleted: false
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    message.isDeleted = true;
    message.deletedAt = new Date();
    message.content = 'This message was deleted';

    await message.save();

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/chat/messages/:id/reactions
// @desc    Add reaction to message
// @access  Private
router.post('/messages/:id/reactions', [
  body('emoji').notEmpty().withMessage('Emoji is required')
], authMiddleware, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const message = await Message.findOne({
      _id: req.params.id,
      isDeleted: false
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    await message.addReaction(req.user.id, req.body.emoji);

    res.json(message);
  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/chat/messages/:id/reactions
// @desc    Remove reaction from message
// @access  Private
router.delete('/messages/:id/reactions', [
  body('emoji').notEmpty().withMessage('Emoji is required')
], authMiddleware, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const message = await Message.findOne({
      _id: req.params.id,
      isDeleted: false
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    await message.removeReaction(req.user.id, req.body.emoji);

    res.json(message);
  } catch (error) {
    console.error('Remove reaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/chat/users
// @desc    Get users for starting conversations
// @access  Private
router.get('/users', authMiddleware, async (req, res) => {
  try {
    console.log('Getting users for chat:', {
      companyId: req.user.companyId,
      currentUserId: req.user.id,
      currentUserRole: req.user.role
    });

    const users = await User.find({
      companyId: req.user.companyId,
      _id: { $ne: req.user.id },
      isActive: true
    })
    .select('name email role')
    .sort({ name: 1 });

    console.log('Found users for chat:', users.length, users.map(u => ({ id: u._id, name: u.name, role: u.role })));

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/chat/unread-count
// @desc    Get total unread message count
// @access  Private
router.get('/unread-count', authMiddleware, async (req, res) => {
  try {
    const unreadData = await Message.getUnreadCount(req.user.id, req.user.companyId);
    
    const totalUnread = unreadData.reduce((sum, item) => sum + item.count, 0);
    
    res.json({
      totalUnread,
      conversations: unreadData
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/chat/users/status
// @desc    Get user statuses for the company
// @access  Private
router.get('/users/status', authMiddleware, async (req, res) => {
  try {
    // Get all users in the company
    const users = await User.find({
      companyId: req.user.companyId,
      isActive: true
    }).select('_id name email');

    // Get status for each user
    const userIds = users.map(user => user._id.toString());
    const statuses = userStatusService.getUsersStatus(userIds);
    
    console.log('User IDs:', userIds);
    console.log('Statuses from service:', statuses);

    // Combine user data with status
    const usersWithStatus = users.map(user => {
      const userStatus = statuses[user._id.toString()] || {
        status: 'offline',
        lastSeen: null
      };
      
      return {
        ...user.toObject(),
        status: userStatus.status,
        lastSeen: userStatus.lastSeen
      };
    });
    
    console.log('Users with status:', usersWithStatus);

    res.json(usersWithStatus);
  } catch (error) {
    console.error('Get user statuses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/chat/debug
// @desc    Debug endpoint to check chat data
// @access  Private
router.get('/debug', authMiddleware, async (req, res) => {
  try {
    console.log('Debug endpoint called for user:', req.user.id, 'company:', req.user.companyId);
    
    // Check all users in company
    const allUsers = await User.find({ companyId: req.user.companyId });
    console.log('All users in company:', allUsers.length, allUsers.map(u => ({ id: u._id, name: u.name, role: u.role, isActive: u.isActive })));
    
    // Check active users
    const activeUsers = await User.find({ 
      companyId: req.user.companyId, 
      isActive: true 
    });
    console.log('Active users in company:', activeUsers.length);
    
    // Check users excluding current user
    const otherUsers = await User.find({
      companyId: req.user.companyId,
      _id: { $ne: req.user.id },
      isActive: true
    });
    console.log('Other users (excluding current):', otherUsers.length);
    
    // Check all chats in the company
    const allChats = await Chat.find({ companyId: req.user.companyId });
    console.log('All chats in company:', allChats.length);
    
    // Check user's chats
    const userChats = await Chat.getUserChats(req.user.id, req.user.companyId);
    console.log('User chats:', userChats.length);
    
    // Check if user has any participants
    const chatsWithUser = await Chat.find({
      companyId: req.user.companyId,
      'participants.user': req.user.id
    });
    console.log('Chats with user as participant:', chatsWithUser.length);
    
    res.json({
      allUsers: allUsers.length,
      activeUsers: activeUsers.length,
      otherUsers: otherUsers.length,
      allChats: allChats.length,
      userChats: userChats.length,
      chatsWithUser: chatsWithUser.length,
      userChatsData: userChats,
      allUsersData: allUsers.map(u => ({ id: u._id, name: u.name, role: u.role, isActive: u.isActive }))
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/chat/live-users
// @desc    Get currently live/online users
// @access  Private
router.get('/live-users', authMiddleware, async (req, res) => {
  try {
    console.log('Live users endpoint called by user:', req.user.id);
    
    // Get all online users from userStatusService
    const onlineUsers = userStatusService.getAllOnlineUsers();
    console.log('Online users from service:', onlineUsers.length);
    
    // Get users on chat page
    const usersOnChatPage = chatPresenceService.getAllUsersOnChatPage();
    console.log('Users on chat page:', usersOnChatPage.length);
    
    // Get user details for online users
    const onlineUserIds = onlineUsers.map(user => user.userId);
    const userDetails = await User.find({
      _id: { $in: onlineUserIds },
      companyId: req.user.companyId
    }).select('name email role');
    
    // Get all users in company for comparison
    const allCompanyUsers = await User.find({
      companyId: req.user.companyId,
      isActive: true
    }).select('name email role');
    
    res.json({
      onlineUsers: onlineUsers.length,
      usersOnChatPage: usersOnChatPage.length,
      onlineUserDetails: userDetails,
      totalCompanyUsers: allCompanyUsers.length,
      allCompanyUsers: allCompanyUsers,
      onlineUserIds: onlineUserIds,
      usersOnChatPageIds: usersOnChatPage
    });
  } catch (error) {
    console.error('Live users endpoint error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;


