const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
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
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: false
  },
  propertyType: {
    type: String,
    enum: ['apartment', 'house', 'condo', 'townhouse', 'commercial', 'land', 'other'],
    default: 'apartment'
  },
  priority: {
    type: String,
    enum: ['hot', 'warm', 'cold'],
    default: 'warm'
  },
  timeline: {
    type: String,
    enum: ['immediate', '1-3_months', '3-6_months', '6+_months', 'just_browsing'],
    default: 'just_browsing'
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'visit', 'offer', 'closed', 'lost'],
    default: 'new'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reminder: {
    date: {
      type: Date
    },
    message: {
      type: String,
      trim: true
    },
    isCompleted: {
      type: Boolean,
      default: false
    }
  },
  notes: {
    type: String,
    trim: true
  },
  source: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  customFields: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  propertyInterests: [{
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true
    },
    interestLevel: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium'
    },
    notes: {
      type: String,
      trim: true
    },
    viewedAt: {
      type: Date,
      default: Date.now
    },
    lastContacted: {
      type: Date
    },
    status: {
      type: String,
      enum: ['interested', 'viewing', 'negotiating', 'offered', 'rejected', 'purchased'],
      default: 'interested'
    }
  }],
  scoring: {
    score: {
      type: Number,
      default: 0
    },
    maxScore: {
      type: Number,
      default: 100
    },
    percentage: {
      type: Number,
      default: 0
    },
    priority: {
      type: String,
      enum: ['hot', 'warm', 'cold', 'ice'],
      default: 'cold'
    },
    lastScored: {
      type: Date,
      default: Date.now
    },
    scoringModelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LeadScoring'
    },
    scoreBreakdown: [{
      ruleName: String,
      score: Number,
      applied: Boolean
    }]
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Lead', leadSchema);
