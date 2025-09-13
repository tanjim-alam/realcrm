const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  leadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true
  },
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmailCampaign'
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmailTemplate'
  },
  type: {
    type: String,
    enum: ['template', 'campaign', 'manual'],
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  recipient: {
    email: {
      type: String,
      required: true
    },
    name: {
      type: String
    }
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'opened', 'clicked', 'replied', 'bounced', 'failed'],
    default: 'pending'
  },
  tracking: {
    messageId: {
      type: String,
      unique: true,
      sparse: true
    },
    openedAt: {
      type: Date
    },
    clickedAt: {
      type: Date
    },
    repliedAt: {
      type: Date
    },
    bouncedAt: {
      type: Date
    },
    bounceReason: {
      type: String
    },
    openCount: {
      type: Number,
      default: 0
    },
    clickCount: {
      type: Number,
      default: 0
    },
    clickedLinks: [{
      url: String,
      clickedAt: Date
    }]
  },
  sentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for better query performance
emailLogSchema.index({ companyId: 1, leadId: 1, status: 1 });
emailLogSchema.index({ 'tracking.messageId': 1 });
emailLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('EmailLog', emailLogSchema);
