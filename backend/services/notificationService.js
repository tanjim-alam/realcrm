const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendNotificationEmail, sendTestEmail } = require('./emailService');

class NotificationService {
    constructor() {
        this.clients = new Map();
    }

    addClient(userId, ws) {
        if (!this.clients.has(userId)) {
            this.clients.set(userId, new Set());
        }
        this.clients.get(userId).add(ws);
        ws.on('close', () => this.removeClient(userId, ws));
    }

    removeClient(userId, ws) {
        if (this.clients.has(userId)) {
            this.clients.get(userId).delete(ws);
            if (this.clients.get(userId).size === 0) {
                this.clients.delete(userId);
            }
        }
    }

    async sendToUser(userId, notification) {
        const userClients = this.clients.get(userId);
        if (userClients) {
            userClients.forEach(socket => {
                if (socket.connected) {
                    socket.emit('notification', notification);
                }
            });
        }
    }

    async createLeadNotification(lead, platform = 'manual') {
        try {
            console.log('📝 Creating notification for lead:', lead.name);
            console.log('🎯 Platform:', platform);
            console.log('🎯 Lead assignedTo:', lead.assignedTo);
            console.log('🎯 Lead createdBy:', lead.createdBy);
            console.log('🎯 Target user ID:', lead.assignedTo || lead.createdBy);

            const notification = await Notification.createLeadNotification(lead, platform);
            console.log('📋 Notification created:', notification._id);

            const targetUserId = lead.assignedTo || lead.createdBy;
            console.log('🎯 Final target user ID:', targetUserId);

            if (targetUserId) {
                console.log('📡 Sending real-time notification to user:', targetUserId);
                // Send real-time notification
                await this.sendToUser(targetUserId, notification);
                console.log('✅ Real-time notification sent');

                console.log('📧 Sending email notification to user:', targetUserId);
                // Send email notification
                const emailResult = await this.sendEmailNotification(notification, targetUserId);
                console.log('📧 Email notification result:', emailResult);
            } else {
                console.log('⚠️ No target user found for notification');
            }

            return notification;
        } catch (error) {
            console.error('❌ Error creating lead notification:', error);
            throw error;
        }
    }

    async sendEmailNotification(notification, userId) {
        try {
            console.log('🔍 ===== EMAIL NOTIFICATION DEBUG START =====');
            console.log('🔍 Looking up user settings for:', userId);
            console.log('📋 Notification details:', {
                id: notification._id,
                title: notification.title,
                type: notification.type,
                platform: notification.platform
            });

            // Get user's notification settings and email
            const user = await User.findById(userId).select('notificationEmail email notificationSettings');
            console.log('👤 User found:', {
                id: user._id,
                email: user.email,
                notificationEmail: user.notificationEmail,
                hasSettings: !!user.notificationSettings,
                settings: user.notificationSettings
            });

            const userEmail = user.notificationEmail || user.email;
            console.log('📧 Final user email:', userEmail);

            if (!userEmail) {
                console.log('❌ No email address found for user:', userId);
                console.log('🔍 ===== EMAIL NOTIFICATION DEBUG END (NO EMAIL) =====');
                return false;
            }

            // Check if user has email notifications enabled for this type
            const notificationType = this.getNotificationTypeFromTitle(notification.title);
            console.log('🔔 Notification type detected:', notificationType);
            console.log('🔔 User email settings for this type:', user.notificationSettings?.email?.[notificationType]);

            if (user.notificationSettings?.email?.[notificationType] === false) {
                console.log('❌ Email notifications disabled for this type:', notificationType);
                console.log('🔍 ===== EMAIL NOTIFICATION DEBUG END (DISABLED) =====');
                return false;
            }

            console.log('✅ Email notifications enabled, sending email...');
            console.log('📧 Sending to email:', userEmail);
            console.log('📧 Notification title:', notification.title);
            console.log('📧 Notification message:', notification.message);

            // Send email
            const emailSent = await sendNotificationEmail(notification, userEmail);
            if (emailSent) {
                console.log('✅ Email notification sent successfully to:', userEmail);
            } else {
                console.log('❌ Failed to send email notification');
            }
            console.log('🔍 ===== EMAIL NOTIFICATION DEBUG END =====');

            return emailSent;
        } catch (error) {
            console.error('❌ Error sending email notification:', error);
            console.error('❌ Error stack:', error.stack);
            console.log('🔍 ===== EMAIL NOTIFICATION DEBUG END (ERROR) =====');
            return false;
        }
    }

    getNotificationTypeFromTitle(title) {
        console.log('🔍 Analyzing notification title:', title);
        if (title.includes('Reminder')) {
            console.log('✅ Detected notification type: leadReminders');
            return 'leadReminders';
        }
        if (title.includes('Task') && title.includes('Assigned')) {
            console.log('✅ Detected notification type: taskAssignments');
            return 'taskAssignments';
        }
        if (title.includes('Lead') && title.includes('Assigned')) {
            console.log('✅ Detected notification type: leadAssignments');
            return 'leadAssignments';
        }
        if (title.includes('Lead')) {
            console.log('✅ Detected notification type: newLeads');
            return 'newLeads';
        }
        if (title.includes('Property')) {
            console.log('✅ Detected notification type: newProperties');
            return 'newProperties';
        }
        if (title.includes('Task')) {
            console.log('✅ Detected notification type: newTasks');
            return 'newTasks';
        }
        if (title.includes('System')) {
            console.log('✅ Detected notification type: systemUpdates');
            return 'systemUpdates';
        }
        console.log('⚠️ Using default notification type: newLeads');
        return 'newLeads'; // default
    }

    detectPlatform(leadData) {
        const { source, utmSource, sourceUrl } = leadData;
        if (utmSource) {
            switch (utmSource.toLowerCase()) {
                case 'google': case 'googleads': return 'google_ads';
                case 'facebook': case 'meta': return 'meta_ads';
                case 'hubspot': return 'hubspot';
                case 'salesforce': return 'salesforce';
            }
        }
        if (source) {
            switch (source.toLowerCase()) {
                case 'website': case 'web': return 'website';
                case 'google_ads': return 'google_ads';
                case 'facebook_ads': case 'meta_ads': return 'meta_ads';
                case 'hubspot': return 'hubspot';
                case 'salesforce': return 'salesforce';
            }
        }
        if (sourceUrl) {
            if (sourceUrl.includes('googleads') || sourceUrl.includes('gclid=')) return 'google_ads';
            if (sourceUrl.includes('facebook') || sourceUrl.includes('fbclid=')) return 'meta_ads';
            return 'website';
        }
        return 'manual';
    }

    async createLeadAssignmentNotification(lead, assignedTo, assignedBy) {
        try {
            console.log('🔍 ===== LEAD ASSIGNMENT NOTIFICATION DEBUG START =====');
            console.log('📝 Creating lead assignment notification for:', lead.name);
            console.log('👤 Assigned to:', assignedTo.name, '(ID:', assignedTo._id, ')');
            console.log('👤 Assigned by:', assignedBy.name, '(ID:', assignedBy._id, ')');
            console.log('🏢 Company ID:', lead.companyId);

            const notification = await Notification.createLeadAssignmentNotification(lead, assignedTo, assignedBy);
            console.log('📋 Lead assignment notification created:', notification._id);
            console.log('📋 Notification details:', {
                title: notification.title,
                message: notification.message,
                type: notification.type,
                platform: notification.platform,
                priority: notification.priority
            });

            // Send real-time notification
            console.log('📡 Sending real-time lead assignment notification to user:', assignedTo._id);
            await this.sendToUser(assignedTo._id, notification);
            console.log('✅ Real-time lead assignment notification sent');

            // Send email notification
            console.log('📧 Sending lead assignment email notification to user:', assignedTo._id);
            const emailResult = await this.sendEmailNotification(notification, assignedTo._id);
            console.log('📧 Lead assignment email notification result:', emailResult);
            console.log('🔍 ===== LEAD ASSIGNMENT NOTIFICATION DEBUG END =====');

            return notification;
        } catch (error) {
            console.error('❌ Error creating lead assignment notification:', error);
            console.error('❌ Error stack:', error.stack);
            throw error;
        }
    }

    async createTaskAssignmentNotification(task, assignedTo, assignedBy) {
        try {
            console.log('🔍 ===== TASK ASSIGNMENT NOTIFICATION DEBUG START =====');
            console.log('📝 Creating task assignment notification for:', task.title);
            console.log('👤 Assigned to:', assignedTo.name, '(ID:', assignedTo._id, ')');
            console.log('👤 Assigned by:', assignedBy.name, '(ID:', assignedBy._id, ')');
            console.log('🏢 Company ID:', task.companyId);

            const notification = await Notification.createTaskAssignmentNotification(task, assignedTo, assignedBy);
            console.log('📋 Task assignment notification created:', notification._id);
            console.log('📋 Notification details:', {
                title: notification.title,
                message: notification.message,
                type: notification.type,
                platform: notification.platform,
                priority: notification.priority
            });

            // Send real-time notification
            console.log('📡 Sending real-time task assignment notification to user:', assignedTo._id);
            await this.sendToUser(assignedTo._id, notification);
            console.log('✅ Real-time task assignment notification sent');

            // Send email notification
            console.log('📧 Sending task assignment email notification to user:', assignedTo._id);
            const emailResult = await this.sendEmailNotification(notification, assignedTo._id);
            console.log('📧 Task assignment email notification result:', emailResult);
            console.log('🔍 ===== TASK ASSIGNMENT NOTIFICATION DEBUG END =====');

            return notification;
        } catch (error) {
            console.error('❌ Error creating task assignment notification:', error);
            console.error('❌ Error stack:', error.stack);
            throw error;
        }
    }

    async createLeadReminderNotification(lead, assignedTo) {
        try {
            console.log('🔍 ===== LEAD REMINDER NOTIFICATION DEBUG START =====');
            console.log('📝 Creating lead reminder notification for:', lead.name);
            console.log('👤 Assigned to:', assignedTo.name, '(ID:', assignedTo._id, ')');
            console.log('🏢 Company ID:', lead.companyId);
            console.log('⏰ Reminder date:', lead.reminder.date);

            const notification = await Notification.createLeadReminderNotification(lead, assignedTo);
            console.log('📋 Lead reminder notification created:', notification._id);
            console.log('📋 Notification details:', {
                title: notification.title,
                message: notification.message,
                type: notification.type,
                platform: notification.platform,
                priority: notification.priority
            });

            // Send real-time notification
            console.log('📡 Sending real-time lead reminder notification to user:', assignedTo._id);
            await this.sendToUser(assignedTo._id, notification);
            console.log('✅ Real-time lead reminder notification sent');

            // Send email notification
            console.log('📧 Sending lead reminder email notification to user:', assignedTo._id);
            const emailResult = await this.sendEmailNotification(notification, assignedTo._id);
            console.log('📧 Lead reminder email notification result:', emailResult);
            console.log('🔍 ===== LEAD REMINDER NOTIFICATION DEBUG END =====');

            return notification;
        } catch (error) {
            console.error('❌ Error creating lead reminder notification:', error);
            console.error('❌ Error stack:', error.stack);
            throw error;
        }
    }
}

const notificationService = new NotificationService();
module.exports = notificationService;
