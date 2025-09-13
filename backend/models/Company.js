const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
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
  phone: {
    type: String,
    trim: true
  },
  plan: {
    type: String,
    enum: ['free', 'basic', 'premium'],
    default: 'free'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  smtpConfig: {
    host: {
      type: String,
      default: 'smtp.gmail.com'
    },
    port: {
      type: Number,
      default: 587
    },
    secure: {
      type: Boolean,
      default: false
    },
    auth: {
      user: {
        type: String,
        default: process.env.EMAIL_USER
      },
      pass: {
        type: String,
        default: process.env.EMAIL_APP_PASSWORD
      }
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Company', companySchema);
