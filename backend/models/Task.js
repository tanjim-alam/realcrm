const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dueDate: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  // Related entities
  relatedTo: {
    type: {
      type: String,
      enum: ['lead', 'property', 'campaign', 'document', 'none'],
      default: 'none'
    },
    id: {
      type: mongoose.Schema.Types.ObjectId
    }
  },
  // Task categories
  category: {
    type: String,
    enum: ['follow_up', 'meeting', 'call', 'email', 'document', 'inspection', 'negotiation', 'closing', 'other'],
    default: 'other'
  },
  // Tags for better organization
  tags: [{
    type: String,
    trim: true
  }],
  // Comments/Notes
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    comment: {
      type: String,
      required: true,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Reminder settings
  reminder: {
    enabled: {
      type: Boolean,
      default: false
    },
    date: {
      type: Date
    },
    isCompleted: {
      type: Boolean,
      default: false
    }
  },
  // Progress tracking
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  // Estimated time (in hours)
  estimatedHours: {
    type: Number,
    min: 0
  },
  // Actual time spent (in hours)
  actualHours: {
    type: Number,
    min: 0,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better performance
taskSchema.index({ companyId: 1, status: 1 });
taskSchema.index({ companyId: 1, assignedTo: 1 });
taskSchema.index({ companyId: 1, dueDate: 1 });
taskSchema.index({ companyId: 1, priority: 1 });
taskSchema.index({ 'relatedTo.type': 1, 'relatedTo.id': 1 });

// Virtual for overdue status
taskSchema.virtual('isOverdue').get(function() {
  if (this.status === 'completed' || this.status === 'cancelled') {
    return false;
  }
  return this.dueDate && this.dueDate < new Date();
});

// Virtual for days until due
taskSchema.virtual('daysUntilDue').get(function() {
  if (!this.dueDate) return null;
  const now = new Date();
  const diffTime = this.dueDate - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Method to add comment
taskSchema.methods.addComment = function(userId, comment) {
  this.comments.push({
    user: userId,
    comment: comment,
    createdAt: new Date()
  });
  return this.save();
};

// Method to update progress
taskSchema.methods.updateProgress = function(progress) {
  this.progress = Math.max(0, Math.min(100, progress));
  if (this.progress === 100 && this.status !== 'completed') {
    this.status = 'completed';
    this.completedAt = new Date();
  }
  return this.save();
};

// Method to mark as completed
taskSchema.methods.markCompleted = function() {
  this.status = 'completed';
  this.progress = 100;
  this.completedAt = new Date();
  return this.save();
};

// Static method to get tasks by user
taskSchema.statics.getTasksByUser = function(userId, companyId, filters = {}) {
  const query = {
    assignedTo: userId,
    companyId: companyId
  };
  
  if (filters.status) {
    query.status = filters.status;
  }
  
  if (filters.priority) {
    query.priority = filters.priority;
  }
  
  if (filters.category) {
    query.category = filters.category;
  }
  
  return this.find(query)
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email')
    .populate('relatedTo.id')
    .sort({ dueDate: 1, priority: -1, createdAt: -1 });
};

// Static method to get overdue tasks
taskSchema.statics.getOverdueTasks = function(companyId) {
  return this.find({
    companyId: companyId,
    status: { $in: ['pending', 'in_progress'] },
    dueDate: { $lt: new Date() }
  })
  .populate('assignedTo', 'name email')
  .populate('createdBy', 'name email')
  .populate('relatedTo.id')
  .sort({ dueDate: 1 });
};

// Static method to get tasks due today
taskSchema.statics.getTasksDueToday = function(companyId) {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));
  
  return this.find({
    companyId: companyId,
    status: { $in: ['pending', 'in_progress'] },
    dueDate: { $gte: startOfDay, $lte: endOfDay }
  })
  .populate('assignedTo', 'name email')
  .populate('createdBy', 'name email')
  .populate('relatedTo.id')
  .sort({ priority: -1, dueDate: 1 });
};

module.exports = mongoose.model('Task', taskSchema);


