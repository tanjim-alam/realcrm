const Lead = require('../models/Lead');
const User = require('../models/User');
const notificationService = require('./notificationService');

class ReminderChecker {
    constructor() {
        this.isRunning = false;
        this.checkInterval = 30 * 60 * 1000; // Check every 30 minutes
        this.reminderIntervals = [
            { hours: 24, label: '24 hours' },
            { hours: 2, label: '2 hours' },
            { hours: 1, label: '1 hour' },
            { hours: 0.5, label: '30 minutes' }
        ];
        this.sentNotifications = new Map();
    }

    start() {
        if (this.isRunning) {
            console.log('⚠️ Reminder checker is already running');
            return;
        }

        console.log('🚀 Starting lead reminder checker...');
        this.isRunning = true;

        // Run immediately on start
        this.checkReminders();

        // Then run every 30 minutes
        this.intervalId = setInterval(() => {
            this.checkReminders();
        }, this.checkInterval);
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isRunning = false;
        console.log('🛑 Lead reminder checker stopped');
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

            console.log('✅ Lead reminder check completed');
        } catch (error) {
            console.error('❌ Error checking lead reminders:', error);
        }
    }

    async checkLeadReminder(lead, now) {
        try {
            const reminderDate = new Date(lead.reminder.date);
            const timeDiff = reminderDate.getTime() - now.getTime();
            const hoursLeft = timeDiff / (1000 * 60 * 60);

            console.log(`🔍 Checking reminder for lead ${lead.name}: ${hoursLeft.toFixed(2)} hours left`);

            // Check if we should send a notification for this interval
            for (const interval of this.reminderIntervals) {
                if (hoursLeft <= interval.hours && hoursLeft > 0) {
                    // Check if we already sent a notification for this interval
                    const notificationKey = `reminder_${interval.hours}h_${lead._id}`;

                    if (!this.sentNotifications.has(notificationKey)) {
                        console.log(`⏰ Sending ${interval.label} reminder for lead ${lead.name}`);

                        // Send notification
                        await notificationService.createLeadReminderNotification(lead, lead.assignedTo);

                        // Mark as sent
                        this.sentNotifications.set(notificationKey, true);

                        // Clean up old notifications after 2 hours
                        setTimeout(() => {
                            this.sentNotifications.delete(notificationKey);
                        }, 2 * 60 * 60 * 1000);
                    }
                    break; // Only send one notification per check
                }
            }

            // Mark reminder as completed if time has passed
            if (hoursLeft <= 0) {
                console.log(`✅ Marking reminder as completed for lead ${lead.name}`);
                await Lead.findByIdAndUpdate(lead._id, {
                    'reminder.isCompleted': true
                });
            }

        } catch (error) {
            console.error(`❌ Error checking reminder for lead ${lead.name}:`, error);
        }
    }
}

// Initialize the reminder checker
const reminderChecker = new ReminderChecker();

// Start the reminder checker when the module is loaded
reminderChecker.start();

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('🛑 Received SIGINT, stopping reminder checker...');
    reminderChecker.stop();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('🛑 Received SIGTERM, stopping reminder checker...');
    reminderChecker.stop();
    process.exit(0);
});

module.exports = reminderChecker;
