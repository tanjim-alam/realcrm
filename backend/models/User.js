const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
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
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'agent'],
    default: 'agent'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  leadCapacity: {
    type: Number,
    default: 50,
    min: 1
  },
  specializations: {
    propertyTypes: [{
      type: String,
      enum: ['apartment', 'house', 'condo', 'townhouse', 'commercial', 'land', 'luxury', 'first_time_buyer']
    }],
    areas: [{
      type: String,
      trim: true
    }],
    budgetRange: {
      min: {
        type: Number,
        default: 0
      },
      max: {
        type: Number,
        default: 10000000
      }
    },
    experience: {
      type: String,
      enum: ['junior', 'mid', 'senior', 'expert'],
      default: 'mid'
    }
  },
  availability: {
    isAvailable: {
      type: Boolean,
      default: true
    },
    responseTime: {
      type: String,
      enum: ['immediate', 'within_hour', 'within_day', 'within_week'],
      default: 'within_day'
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
