const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
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
  type: {
    type: String,
    enum: ['direct', 'group', 'channel'],
    default: 'direct'
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    lastReadAt: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // For group chats
  settings: {
    allowInvites: {
      type: Boolean,
      default: true
    },
    allowFileSharing: {
      type: Boolean,
      default: true
    },
    allowMessageEditing: {
      type: Boolean,
      default: true
    },
    allowMessageDeletion: {
      type: Boolean,
      default: true
    }
  },
  // Last message info for quick access
  lastMessage: {
    content: String,
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sentAt: {
      type: Date
    },
    type: {
      type: String,
      enum: ['text', 'image', 'file', 'system'],
      default: 'text'
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
chatSchema.index({ companyId: 1, isActive: 1 });
chatSchema.index({ 'participants.user': 1 });
chatSchema.index({ companyId: 1, type: 1 });

// Virtual for unread count (will be calculated in real-time)
chatSchema.virtual('unreadCount').get(function() {
  // This will be calculated dynamically based on user's lastReadAt
  return 0;
});

// Method to add participant
chatSchema.methods.addParticipant = function(userId) {
  const existingParticipant = this.participants.find(p => p.user.toString() === userId.toString());
  if (!existingParticipant) {
    this.participants.push({
      user: userId,
      joinedAt: new Date(),
      lastReadAt: new Date(),
      isActive: true
    });
  }
  return this.save();
};

// Method to remove participant
chatSchema.methods.removeParticipant = function(userId) {
  this.participants = this.participants.filter(p => p.user.toString() !== userId.toString());
  return this.save();
};

// Method to update last read time
chatSchema.methods.updateLastRead = function(userId) {
  const participant = this.participants.find(p => p.user.toString() === userId.toString());
  if (participant) {
    participant.lastReadAt = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to check if user is participant
chatSchema.methods.isParticipant = function(userId) {
  return this.participants.some(p => p.user.toString() === userId.toString() && p.isActive);
};

// Static method to get user's chats
chatSchema.statics.getUserChats = function(userId, companyId) {
  return this.find({
    companyId,
    isActive: true,
    'participants.user': userId,
    'participants.isActive': true
  })
  .populate('participants.user', 'name email')
  .populate('createdBy', 'name email')
  .populate('lastMessage.sentBy', 'name email')
  .sort({ updatedAt: -1 });
};

// Static method to get or create direct chat
chatSchema.statics.getOrCreateDirectChat = function(user1Id, user2Id, companyId) {
  console.log('getOrCreateDirectChat called with:', { user1Id, user2Id, companyId });
  
  return this.findOne({
    companyId,
    type: 'direct',
    $and: [
      { 'participants.user': user1Id },
      { 'participants.user': user2Id }
    ]
  }).then(chat => {
    if (chat) {
      console.log('Found existing direct chat:', chat._id);
      return chat;
    }
    
    console.log('Creating new direct chat...');
    // Create new direct chat
    return this.create({
      companyId,
      name: 'Direct Chat',
      type: 'direct',
      participants: [
        { user: user1Id },
        { user: user2Id }
      ],
      createdBy: user1Id
    }).then(newChat => {
      console.log('Created new direct chat:', newChat._id);
      return newChat;
    });
  });
};

module.exports = mongoose.model('Chat', chatSchema);


