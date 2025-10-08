const cron = require('node-cron');
const Lead = require('../models/Lead');
const User = require('../models/User');
const notificationService = require('./notificationService');

class ReminderService {
    constructor() {
        this.isRunning = false;
        this.sentNotifications = new Map();
        this.reminderIntervals = [
            { hours: 24, label: '24 hours' },
            { hours: 2, label: '2 hours' },
            { hours: 1, label: '1 hour' },
            { hours: 0.5, label: '30 minutes' }
        ];
    }

    start() {
        if (this.isRunning) {
            console.log('Reminder service is already running');
            return;
        }

        console.log('Starting lead reminder service...');
        this.isRunning = true;

        // Run every minute to check for reminders
        this.task = cron.schedule('* * * * *', () => {
            this.checkReminders();
        });

        console.log('Lead reminder service started successfully');
    }

    stop() {
        if (this.task) {
            this.task.stop();
            this.isRunning = false;
            console.log('Lead reminder service stopped');
        }
    }

    async checkReminders() {
        try {
            console.log('🔍 Checking for lead reminders...');
            const now = new Date();

            // Find leads with reminders that are due soon
            const leadsWithReminders = await Lead.find({
                'reminder.date': { $exists: true, $ne: null },
                'reminder.isCompleted': false,
                'assignedTo': { $exists: true, $ne: null }
            }).populate('assignedTo', 'name email');

            console.log(`📋 Found ${leadsWithReminders.length} leads with reminders`);

            for (const lead of leadsWithReminders) {
                await this.checkLeadReminder(lead, now);
            }

            // Clean up old sent notifications (older than 2 hours)
            this.cleanupOldNotifications();

        } catch (error) {
            console.error('❌ Error checking lead reminders:', error);
        }
    }

    async checkLeadReminder(lead, now) {
        try {
            const reminderDate = new Date(lead.reminder.date);
            const timeDiff = reminderDate.getTime() - now.getTime();
            const hoursLeft = timeDiff / (1000 * 60 * 60);

            // Skip if reminder time has already passed
            if (hoursLeft < 0) {
                // Mark reminder as completed
                await Lead.findByIdAndUpdate(lead._id, {
                    'reminder.isCompleted': true
                });
                console.log(`✅ Marked reminder as completed for lead ${lead.name}`);
                return;
            }

            // Get user's custom reminder timeline settings
            const user = await User.findById(lead.assignedTo._id).select('notificationSettings.reminderTimeline');
            const userTimeline = user?.notificationSettings?.reminderTimeline;

            // Use user's custom intervals if available and enabled, otherwise use default
            const intervals = (userTimeline?.enabled && userTimeline?.intervals?.length > 0)
                ? userTimeline.intervals
                : this.reminderIntervals;

            console.log(`🔍 Using reminder intervals for user ${lead.assignedTo.name}:`, intervals);

            // Check if we should send a notification for this interval
            for (const interval of intervals) {
                if (hoursLeft <= interval.hours && hoursLeft > 0) {
                    const notificationKey = `reminder_${interval.hours}h_${lead._id}`;

                    if (!this.sentNotifications.has(notificationKey)) {
                        console.log(`⏰ Sending ${interval.label} reminder for lead ${lead.name} (${hoursLeft.toFixed(2)} hours left)`);

                        // Send notification
                        await notificationService.createLeadReminderNotification(lead, lead.assignedTo);

                        // Mark as sent
                        this.sentNotifications.set(notificationKey, now.getTime());
                    }
                    break; // Only send one notification per check
                }
            }

        } catch (error) {
            console.error(`❌ Error checking reminder for lead ${lead.name}:`, error);
        }
    }

    cleanupOldNotifications() {
        const twoHoursAgo = Date.now() - (2 * 60 * 60 * 1000);
        for (const [key, timestamp] of this.sentNotifications.entries()) {
            if (timestamp < twoHoursAgo) {
                this.sentNotifications.delete(key);
            }
        }
    }
}

// Create a singleton instance
const reminderService = new ReminderService();

module.exports = reminderService;


