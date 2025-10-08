const express = require('express');
const { body, validationResult } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');
const Notification = require('../models/Notification');
const User = require('../models/User');

const router = express.Router();

// @route   GET /api/notifications
// @desc    Get all notifications for user
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { page = 1, limit = 20, type, platform, isRead, priority } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const query = {
            companyId: req.user.companyId,
            userId: req.user.id,
            isArchived: false,
            expiresAt: { $gt: new Date() }
        };

        // Apply filters
        if (type) query.type = type;
        if (platform) query.platform = platform;
        if (isRead !== undefined) query.isRead = isRead === 'true';
        if (priority) query.priority = priority;

        const notifications = await Notification.find(query)
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Notification.countDocuments(query);

        res.json({
            notifications,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / parseInt(limit)),
                total
            }
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/notifications/unread-count
// @desc    Get unread notifications count
// @access  Private
router.get('/unread-count', authMiddleware, async (req, res) => {
    try {
        const count = await Notification.getUnreadCount(req.user.companyId, req.user.id);
        res.json({ count });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/notifications/recent
// @desc    Get recent notifications
// @access  Private
router.get('/recent', authMiddleware, async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const notifications = await Notification.getRecentNotifications(
            req.user.companyId,
            req.user.id,
            parseInt(limit)
        );
        res.json(notifications);
    } catch (error) {
        console.error('Get recent notifications error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/notifications/mark-read
// @desc    Mark notifications as read
// @access  Private
router.put('/mark-read', authMiddleware, [
    body('notificationIds').isArray().withMessage('Notification IDs must be an array')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { notificationIds } = req.body;
        const result = await Notification.markAsRead(notificationIds, req.user.id);

        res.json({
            message: 'Notifications marked as read',
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Mark notifications as read error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/notifications/mark-all-read
// @desc    Mark all notifications as read
// @access  Private
router.put('/mark-all-read', authMiddleware, async (req, res) => {
    try {
        const result = await Notification.updateMany(
            {
                companyId: req.user.companyId,
                userId: req.user.id,
                isRead: false,
                isArchived: false
            },
            {
                isRead: true,
                readAt: new Date()
            }
        );

        res.json({
            message: 'All notifications marked as read',
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Mark all notifications as read error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/notifications/:id/archive
// @desc    Archive a notification
// @access  Private
router.put('/:id/archive', authMiddleware, async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            {
                _id: req.params.id,
                companyId: req.user.companyId,
                userId: req.user.id
            },
            { isArchived: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json({ message: 'Notification archived', notification });
    } catch (error) {
        console.error('Archive notification error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete a notification
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            companyId: req.user.companyId,
            userId: req.user.id
        });

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json({ message: 'Notification deleted' });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/notifications/stats
// @desc    Get notification statistics
// @access  Private
router.get('/stats', authMiddleware, async (req, res) => {
    try {
        const companyId = req.user.companyId;
        const userId = req.user.id;

        const [
            totalNotifications,
            unreadNotifications,
            todayNotifications,
            platformBreakdown,
            typeBreakdown
        ] = await Promise.all([
            Notification.countDocuments({ companyId, userId, isArchived: false }),
            Notification.countDocuments({ companyId, userId, isRead: false, isArchived: false }),
            Notification.countDocuments({
                companyId,
                userId,
                isArchived: false,
                createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
            }),
            Notification.aggregate([
                { $match: { companyId, userId, isArchived: false } },
                { $group: { _id: '$platform', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),
            Notification.aggregate([
                { $match: { companyId, userId, isArchived: false } },
                { $group: { _id: '$type', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ])
        ]);

        res.json({
            total: totalNotifications,
            unread: unreadNotifications,
            today: todayNotifications,
            platformBreakdown,
            typeBreakdown
        });
    } catch (error) {
        console.error('Get notification stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/notifications/settings
// @desc    Get notification settings for user
// @access  Private
router.get('/settings', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('notificationEmail notificationSettings');

        const defaultSettings = {
            notificationEmail: user.notificationEmail || '',
            email: {
                newLeads: true,
                newProperties: true,
                newTasks: true,
                systemUpdates: true,
                marketing: false
            },
            push: {
                newLeads: true,
                newProperties: true,
                newTasks: true,
                systemUpdates: true,
                marketing: false
            },
            frequency: 'immediate', // immediate, daily, weekly
            quietHours: {
                enabled: false,
                start: '22:00',
                end: '08:00'
            }
        };

        const settings = {
            notificationEmail: user.notificationEmail || '',
            ...(user.notificationSettings || defaultSettings)
        };
        res.json(settings);
    } catch (error) {
        console.error('Get notification settings error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/notifications/settings
// @desc    Update notification settings for user
// @access  Private
router.put('/settings', [
    body('notificationEmail').optional().isEmail().withMessage('Invalid email format'),
    body('email').optional().isObject().withMessage('Email settings must be an object'),
    body('push').optional().isObject().withMessage('Push settings must be an object'),
    body('frequency').optional().isIn(['immediate', 'daily', 'weekly']).withMessage('Invalid frequency'),
    body('quietHours').optional().isObject().withMessage('Quiet hours must be an object')
], authMiddleware, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { notificationEmail, email, push, frequency, quietHours } = req.body;

        const updateData = {};
        if (notificationEmail !== undefined) updateData['notificationEmail'] = notificationEmail;
        if (email) updateData['notificationSettings.email'] = email;
        if (push) updateData['notificationSettings.push'] = push;
        if (frequency) updateData['notificationSettings.frequency'] = frequency;
        if (quietHours) updateData['notificationSettings.quietHours'] = quietHours;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updateData },
            { new: true }
        ).select('notificationEmail notificationSettings');

        const response = {
            notificationEmail: user.notificationEmail || '',
            ...user.notificationSettings
        };

        res.json(response);
    } catch (error) {
        console.error('Update notification settings error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/notifications/test
// @desc    Send a test notification
// @access  Private
router.post('/test', [
    body('type').isIn(['lead', 'property', 'task', 'system', 'platform_integration', 'chat_message']).withMessage('Invalid notification type'),
    body('message').notEmpty().withMessage('Message is required'),
    body('platform').optional().isIn(['manual', 'website', 'google_ads', 'meta_ads', 'hubspot', 'salesforce', 'zapier', 'other']).withMessage('Invalid platform'),
    body('email').optional().isEmail().withMessage('Invalid email format')
], authMiddleware, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { type, message, platform = 'manual', email } = req.body;

        const notification = new Notification({
            companyId: req.user.companyId,
            userId: req.user.id,
            type,
            title: `Test ${type.charAt(0).toUpperCase() + type.slice(1)} Notification`,
            message,
            platform,
            priority: 'medium',
            metadata: {
                isTest: true,
                testEmail: email || req.user.email
            }
        });

        await notification.save();

        // Send real-time notification
        const notificationService = require('../services/notificationService');
        await notificationService.sendToUser(req.user.id, notification);

        // Send email notification if email is provided
        let emailSent = false;
        if (email) {
            const { sendTestEmail } = require('../services/emailService');
            emailSent = await sendTestEmail(email, {
                type,
                message,
                platform
            });
        }

        res.json({
            message: 'Test notification sent successfully',
            notification,
            emailSent: !!email
        });
    } catch (error) {
        console.error('Send test notification error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/notifications/reminder-timeline
// @desc    Get user's reminder timeline settings
// @access  Private
router.get('/reminder-timeline', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('notificationSettings.reminderTimeline');
        const reminderTimeline = user?.notificationSettings?.reminderTimeline || {
            enabled: true,
            intervals: [
                { hours: 24, label: '24 hours' },
                { hours: 2, label: '2 hours' },
                { hours: 1, label: '1 hour' },
                { hours: 0.5, label: '30 minutes' }
            ]
        };

        res.json(reminderTimeline);
    } catch (error) {
        console.error('Get reminder timeline error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/notifications/reminder-timeline
// @desc    Update user's reminder timeline settings
// @access  Private
router.put('/reminder-timeline', [
    body('enabled').optional().isBoolean(),
    body('intervals').optional().isArray(),
    body('intervals.*.hours').optional().isNumeric().withMessage('Hours must be a number'),
    body('intervals.*.label').optional().isString().withMessage('Label must be a string')
], authMiddleware, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { enabled, intervals } = req.body;

        // Validate intervals if provided
        if (intervals) {
            // Sort intervals by hours (descending)
            intervals.sort((a, b) => b.hours - a.hours);

            // Validate that intervals are reasonable (between 0.1 and 168 hours)
            for (const interval of intervals) {
                if (interval.hours < 0.1 || interval.hours > 168) {
                    return res.status(400).json({
                        message: 'Reminder intervals must be between 0.1 and 168 hours'
                    });
                }
            }
        }

        const updateData = {};
        if (enabled !== undefined) {
            updateData['notificationSettings.reminderTimeline.enabled'] = enabled;
        }
        if (intervals !== undefined) {
            updateData['notificationSettings.reminderTimeline.intervals'] = intervals;
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updateData },
            { new: true, select: 'notificationSettings.reminderTimeline' }
        );

        res.json(user.notificationSettings.reminderTimeline);
    } catch (error) {
        console.error('Update reminder timeline error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/notifications/reminder-timeline/reset
// @desc    Reset reminder timeline to default settings
// @access  Private
router.post('/reminder-timeline/reset', authMiddleware, async (req, res) => {
    try {
        const defaultIntervals = [
            { hours: 24, label: '24 hours' },
            { hours: 2, label: '2 hours' },
            { hours: 1, label: '1 hour' },
            { hours: 0.5, label: '30 minutes' }
        ];

        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                $set: {
                    'notificationSettings.reminderTimeline.enabled': true,
                    'notificationSettings.reminderTimeline.intervals': defaultIntervals
                }
            },
            { new: true, select: 'notificationSettings.reminderTimeline' }
        );

        res.json(user.notificationSettings.reminderTimeline);
    } catch (error) {
        console.error('Reset reminder timeline error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;