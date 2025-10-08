const express = require('express');
const { body, validationResult } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');
const userStatusService = require('../services/userStatusService');

const router = express.Router();

// @route   GET /api/chat/conversations
// @desc    Get all conversations for user
// @access  Private
router.get('/conversations', authMiddleware, async (req, res) => {
    try {
        const conversations = await Chat.getUserChats(req.user.id, req.user.companyId);

        // Calculate unread count for each conversation
        const conversationsWithUnread = await Promise.all(
            conversations.map(async (chat) => {
                const unreadCount = await Message.countDocuments({
                    chatId: chat._id,
                    isDeleted: false,
                    sender: { $ne: req.user.id },
                    'readBy.user': { $ne: req.user.id }
                });

                return {
                    ...chat.toObject(),
                    unreadCount
                };
            })
        );

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
            .populate('participants.user', 'name email avatar')
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
        const participantIds = [...new Set(participants)];
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
            { path: 'participants.user', select: 'name email avatar' },
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
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { userId } = req.body;

        // Verify user exists and belongs to same company
        const user = await User.findOne({
            _id: userId,
            companyId: req.user.companyId
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const chat = await Chat.getOrCreateDirectChat(req.user.id, userId, req.user.companyId);

        // Populate the chat
        await chat.populate([
            { path: 'participants.user', select: 'name email avatar' },
            { path: 'createdBy', select: 'name email' }
        ]);

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
        const { page = 1, limit = 50 } = req.query;

        // Verify user has access to this conversation
        const chat = await Chat.findOne({
            _id: req.params.id,
            companyId: req.user.companyId,
            'participants.user': req.user.id
        });

        if (!chat) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        const messages = await Message.getChatMessages(req.params.id, parseInt(page), parseInt(limit));

        // Mark messages as read (only for messages not sent by the user)
        await Message.updateMany(
            {
                chatId: req.params.id,
                sender: { $ne: req.user.id },
                'readBy.user': { $ne: req.user.id }
            },
            {
                $push: { readBy: { user: req.user.id, readAt: new Date() } }
            }
        );

        // Update chat's last read time
        await chat.updateLastRead(req.user.id);

        res.json(messages.reverse()); // Return in chronological order
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ message: 'Server error' });
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
            { path: 'sender', select: 'name email avatar' },
            { path: 'replyTo', select: 'content sender' },
            { path: 'replyTo.sender', select: 'name email' }
        ]);


        // Emit message to all participants in real-time
        const io = req.app.get('io');
        if (io) {
            console.log(`Emitting new-message to chat-${req.params.id}`);
            console.log('Message data:', {
                message: message,
                chatId: req.params.id
            });
            io.to(`chat-${req.params.id}`).emit('new-message', {
                message: message,
                chatId: req.params.id
            });
        } else {
            console.error('Socket.IO not available for message emission');
        }

        res.status(201).json(message);
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/chat/users
// @desc    Get users for starting conversations
// @access  Private
router.get('/users', authMiddleware, async (req, res) => {
    try {
        const users = await User.find({
            companyId: req.user.companyId,
            _id: { $ne: req.user.id },
            isActive: true
        })
            .select('name email avatar role')
            .sort({ name: 1 });

        res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
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
        }).select('_id name email avatar');

        // Get status for each user
        const userIds = users.map(user => user._id.toString());
        const statuses = userStatusService.getUsersStatus(userIds);

        // Combine user data with status
        const usersWithStatus = users.map(user => {
            const userStatus = statuses[user._id.toString()] || {
                status: 'offline',
                lastSeen: null,
                isOnChatPage: false
            };

            return {
                ...user.toObject(),
                status: userStatus.status,
                lastSeen: userStatus.lastSeen,
                isOnChatPage: userStatus.isOnChatPage
            };
        });

        res.json(usersWithStatus);
    } catch (error) {
        console.error('Get user statuses error:', error);
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

module.exports = router;
