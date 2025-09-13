const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'email', 'tel', 'number', 'select', 'textarea', 'checkbox', 'radio'],
    required: true
  },
  required: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: ''
  },
  options: [{
    label: String,
    value: String
  }],
  validation: {
    minLength: Number,
    maxLength: Number,
    min: Number,
    max: Number,
    pattern: String
  },
  mapping: {
    type: String,
    enum: ['name', 'email', 'phone', 'budget', 'propertyType', 'location', 'notes', 'source', 'custom'],
    default: 'custom'
  }
});

const formTemplateSchema = new mongoose.Schema({
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
  fields: [fieldSchema],
  settings: {
    submitButtonText: {
      type: String,
      default: 'Submit'
    },
    successMessage: {
      type: String,
      default: 'Thank you! We will contact you soon.'
    },
    redirectUrl: {
      type: String
    },
    theme: {
      type: String,
      enum: ['default', 'modern', 'minimal', 'luxury'],
      default: 'default'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  usage: {
    totalSubmissions: {
      type: Number,
      default: 0
    },
    lastUsed: {
      type: Date
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('FormTemplate', formTemplateSchema);
