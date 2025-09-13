const mongoose = require('mongoose');

const notificationSettingsSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  notifications: {
    newLead: {
      enabled: { type: Boolean, default: true },
      email: { type: String, trim: true, lowercase: true },
      template: { type: String, default: 'default' }
    },
    leadStatusChange: {
      enabled: { type: Boolean, default: false },
      email: { type: String, trim: true, lowercase: true },
      template: { type: String, default: 'default' }
    },
    leadAssignment: {
      enabled: { type: Boolean, default: false },
      email: { type: String, trim: true, lowercase: true },
      template: { type: String, default: 'default' }
    },
    dailySummary: {
      enabled: { type: Boolean, default: false },
      email: { type: String, trim: true, lowercase: true },
      time: { type: String, default: '09:00' } // HH:MM format
    },
    reminder: {
      enabled: { type: Boolean, default: true },
      email: { type: String, trim: true, lowercase: true },
      template: { type: String, default: 'default' },
      advanceTime: { type: Number, default: 15 } // minutes before reminder time
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
notificationSettingsSchema.index({ companyId: 1 });

module.exports = mongoose.model('NotificationSettings', notificationSettingsSchema);


