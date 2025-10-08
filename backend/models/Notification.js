const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['lead', 'property', 'task', 'system', 'platform_integration', 'lead_assignment', 'task_assignment', 'lead_reminder'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    data: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    platform: {
        type: String,
        enum: ['website', 'google_ads', 'meta_ads', 'hubspot', 'salesforce', 'zapier', 'manual', 'api', 'system', 'webhook'],
        default: 'manual'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    isArchived: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    },
    metadata: {
        leadId: mongoose.Schema.Types.ObjectId,
        propertyId: mongoose.Schema.Types.ObjectId,
        taskId: mongoose.Schema.Types.ObjectId,
        sourceUrl: String,
        userAgent: String,
        ipAddress: String,
        campaignId: String,
        adGroupId: String,
        keyword: String,
        utmSource: String,
        utmMedium: String,
        utmCampaign: String,
        utmTerm: String,
        utmContent: String
    }
}, {
    timestamps: true
});

// Indexes for better performance
notificationSchema.index({ companyId: 1, userId: 1, isRead: 1 });
notificationSchema.index({ companyId: 1, type: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static method to create platform-specific notifications
notificationSchema.statics.createPlatformNotification = async function (data) {
    const {
        companyId,
        userId,
        type,
        title,
        message,
        platform,
        priority = 'medium',
        metadata = {},
        data: notificationData = {}
    } = data;

    const notification = new this({
        companyId,
        userId,
        type,
        title,
        message,
        platform,
        priority,
        metadata,
        data: notificationData
    });

    return await notification.save();
};

// Static method to create lead notification
notificationSchema.statics.createLeadNotification = async function (lead, platform = 'manual') {
    const notificationData = {
        companyId: lead.companyId,
        userId: lead.assignedTo || lead.createdBy,
        type: 'lead',
        title: `New Lead from ${platform.charAt(0).toUpperCase() + platform.slice(1).replace('_', ' ')}`,
        message: `${lead.name} (${lead.email}) has been added as a new lead`,
        platform,
        priority: lead.priority === 'hot' ? 'high' : lead.priority === 'warm' ? 'medium' : 'low',
        metadata: {
            leadId: lead._id,
            sourceUrl: lead.sourceUrl,
            utmSource: lead.utmSource,
            utmMedium: lead.utmMedium,
            utmCampaign: lead.utmCampaign
        },
        data: {
            leadName: lead.name,
            leadEmail: lead.email,
            leadPhone: lead.phone,
            leadSource: lead.source,
            leadStatus: lead.status,
            leadPriority: lead.priority
        }
    };

    return await this.createPlatformNotification(notificationData);
};

// Static method to get unread notifications count
notificationSchema.statics.getUnreadCount = async function (companyId, userId) {
    return await this.countDocuments({
        companyId,
        userId,
        isRead: false,
        isArchived: false,
        expiresAt: { $gt: new Date() }
    });
};

// Static method to mark notifications as read
notificationSchema.statics.markAsRead = async function (notificationIds, userId) {
    return await this.updateMany(
        { _id: { $in: notificationIds }, userId },
        { isRead: true, readAt: new Date() }
    );
};

// Static method to get recent notifications
notificationSchema.statics.getRecentNotifications = async function (companyId, userId, limit = 20) {
    return await this.find({
        companyId,
        userId,
        isArchived: false,
        expiresAt: { $gt: new Date() }
    })
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(limit);
};

// Static method to create lead assignment notification
notificationSchema.statics.createLeadAssignmentNotification = async function (lead, assignedTo, assignedBy) {
    const notificationData = {
        companyId: lead.companyId,
        userId: assignedTo._id,
        type: 'lead_assignment',
        title: 'New Lead Assigned',
        message: `You have been assigned a new lead: ${lead.name} (${lead.email})`,
        platform: 'manual',
        priority: 'high',
        metadata: {
            leadId: lead._id,
            assignedBy: assignedBy._id,
            assignedAt: new Date()
        },
        data: {
            leadName: lead.name,
            leadEmail: lead.email,
            leadPhone: lead.phone,
            leadSource: lead.source,
            leadStatus: lead.status,
            leadPriority: lead.priority,
            assignedByName: assignedBy.name,
            assignedByEmail: assignedBy.email
        }
    };
    return await this.createPlatformNotification(notificationData);
};

// Static method to create task assignment notification
notificationSchema.statics.createTaskAssignmentNotification = async function (task, assignedTo, assignedBy) {
    const notificationData = {
        companyId: task.companyId,
        userId: assignedTo._id,
        type: 'task_assignment',
        title: 'New Task Assigned',
        message: `You have been assigned a new task: ${task.title}`,
        platform: 'manual',
        priority: task.priority === 'urgent' ? 'high' : task.priority === 'high' ? 'high' : 'medium',
        metadata: {
            taskId: task._id,
            assignedBy: assignedBy._id,
            assignedAt: new Date()
        },
        data: {
            taskTitle: task.title,
            taskDescription: task.description,
            taskPriority: task.priority,
            taskCategory: task.category,
            taskDueDate: task.dueDate,
            assignedByName: assignedBy.name,
            assignedByEmail: assignedBy.email
        }
    };
    return await this.createPlatformNotification(notificationData);
};

// Static method to create lead reminder notification
notificationSchema.statics.createLeadReminderNotification = async function (lead, assignedTo) {
    const reminderDate = new Date(lead.reminder.date);
    const now = new Date();
    const timeDiff = reminderDate.getTime() - now.getTime();
    const hoursLeft = Math.ceil(timeDiff / (1000 * 60 * 60));

    const notificationData = {
        companyId: lead.companyId,
        userId: assignedTo._id,
        type: 'lead_reminder',
        title: 'Lead Reminder',
        message: `Reminder: ${lead.name} - ${lead.reminder.message || 'Follow up required'} (${hoursLeft} hours left)`,
        platform: 'system',
        priority: hoursLeft <= 2 ? 'high' : hoursLeft <= 24 ? 'medium' : 'low',
        metadata: {
            leadId: lead._id,
            reminderDate: lead.reminder.date,
            hoursLeft: hoursLeft
        },
        data: {
            leadName: lead.name,
            leadEmail: lead.email,
            leadPhone: lead.phone,
            leadSource: lead.source,
            leadStatus: lead.status,
            reminderMessage: lead.reminder.message,
            reminderDate: lead.reminder.date,
            hoursLeft: hoursLeft
        }
    };
    return await this.createPlatformNotification(notificationData);
};

module.exports = mongoose.model('Notification', notificationSchema);
