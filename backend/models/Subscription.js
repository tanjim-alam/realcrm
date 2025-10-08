const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
    unique: true
  },
  plan: {
    type: String,
    enum: ['free', 'basic', 'premium'],
    default: 'free'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  features: {
    maxLeads: {
      type: Number,
      default: 20 // Free plan limit
    },
    maxProperties: {
      type: Number,
      default: 10 // Free plan limit
    },
    maxUsers: {
      type: Number,
      default: 2 // Free plan limit
    },
    hasAnalytics: {
      type: Boolean,
      default: false
    },
    hasCustomBranding: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Set plan features based on plan type
subscriptionSchema.pre('save', function (next) {
  const planFeatures = {
    free: {
      maxLeads: 20,
      maxProperties: 10,
      maxUsers: 2,
      hasAnalytics: false,
      hasCustomBranding: false
    },
    basic: {
      maxLeads: 500,
      maxProperties: 100,
      maxUsers: 5,
      hasAnalytics: true,
      hasCustomBranding: false
    },
    premium: {
      maxLeads: -1, // Unlimited
      maxProperties: -1, // Unlimited
      maxUsers: -1, // Unlimited
      hasAnalytics: true,
      hasCustomBranding: true
    }
  };

  this.features = planFeatures[this.plan];
  next();
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
