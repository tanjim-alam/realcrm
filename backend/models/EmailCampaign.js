const mongoose = require('mongoose');

const emailCampaignSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmailTemplate',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled'],
    default: 'draft'
  },
  recipients: {
    type: {
      type: String,
      enum: ['all_leads', 'specific_leads', 'leads_by_status', 'leads_by_source', 'leads_by_priority'],
      required: true
    },
    filters: {
      status: [{
        type: String,
        enum: ['new', 'contacted', 'visit', 'offer', 'closed', 'lost']
      }],
      source: [String],
      priority: [{
        type: String,
        enum: ['hot', 'warm', 'cold']
      }],
      assignedTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }],
      customFilters: mongoose.Schema.Types.Mixed
    },
    leadIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead'
    }]
  },
  schedule: {
    sendAt: {
      type: Date
    },
    timezone: {
      type: String,
      default: 'UTC'
    }
  },
  stats: {
    totalRecipients: {
      type: Number,
      default: 0
    },
    sent: {
      type: Number,
      default: 0
    },
    delivered: {
      type: Number,
      default: 0
    },
    opened: {
      type: Number,
      default: 0
    },
    clicked: {
      type: Number,
      default: 0
    },
    replied: {
      type: Number,
      default: 0
    },
    bounced: {
      type: Number,
      default: 0
    },
    unsubscribed: {
      type: Number,
      default: 0
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for better query performance
emailCampaignSchema.index({ companyId: 1, status: 1, 'schedule.sendAt': 1 });

module.exports = mongoose.model('EmailCampaign', emailCampaignSchema);
