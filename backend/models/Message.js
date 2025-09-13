const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['text', 'image', 'file', 'system', 'emoji'],
    default: 'text'
  },
  // For file messages
  file: {
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String
  },
  // For edited messages
  editedAt: {
    type: Date
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  // For deleted messages
  deletedAt: {
    type: Date
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  // For replies
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  // Message reactions
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    emoji: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Read receipts
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Message metadata
  metadata: {
    isPinned: {
      type: Boolean,
      default: false
    },
    pinnedAt: Date,
    pinnedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
messageSchema.index({ chatId: 1, createdAt: -1 });
messageSchema.index({ companyId: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ 'readBy.user': 1 });

// Method to add reaction
messageSchema.methods.addReaction = function(userId, emoji) {
  // Remove existing reaction from this user
  this.reactions = this.reactions.filter(r => r.user.toString() !== userId.toString());
  
  // Add new reaction
  this.reactions.push({
    user: userId,
    emoji: emoji,
    createdAt: new Date()
  });
  
  return this.save();
};

// Method to remove reaction
messageSchema.methods.removeReaction = function(userId, emoji) {
  this.reactions = this.reactions.filter(r => 
    !(r.user.toString() === userId.toString() && r.emoji === emoji)
  );
  return this.save();
};

// Method to mark as read
messageSchema.methods.markAsRead = function(userId) {
  const existingRead = this.readBy.find(r => r.user.toString() === userId.toString());
  if (!existingRead) {
    this.readBy.push({
      user: userId,
      readAt: new Date()
    });
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to check if user has read
messageSchema.methods.hasRead = function(userId) {
  return this.readBy.some(r => r.user.toString() === userId.toString());
};

// Method to pin message
messageSchema.methods.pin = function(userId) {
  this.metadata.isPinned = true;
  this.metadata.pinnedAt = new Date();
  this.metadata.pinnedBy = userId;
  return this.save();
};

// Method to unpin message
messageSchema.methods.unpin = function() {
  this.metadata.isPinned = false;
  this.metadata.pinnedAt = undefined;
  this.metadata.pinnedBy = undefined;
  return this.save();
};

// Static method to get messages for chat
messageSchema.statics.getChatMessages = function(chatId, page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  
  return this.find({
    chatId,
    isDeleted: false
  })
  .populate('sender', 'name email')
  .populate('replyTo', 'content sender')
  .populate('replyTo.sender', 'name email')
  .populate('readBy.user', 'name email')
  .populate('reactions.user', 'name email')
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit);
};

// Static method to get unread count for user
messageSchema.statics.getUnreadCount = async function(userId, companyId) {
  try {
    // First, get all chats the user is part of
    const Chat = mongoose.model('Chat');
    const userChats = await Chat.find({
      companyId: companyId,
      'participants.user': userId,
      'participants.isActive': true
    }).select('_id');

    const chatIds = userChats.map(chat => chat._id);

    if (chatIds.length === 0) {
      return [];
    }

    // Get unread messages for these chats (exclude messages sent by the user)
    const unreadMessages = await this.find({
      chatId: { $in: chatIds },
      companyId: companyId,
      isDeleted: false,
      sender: { $ne: userId }, // Exclude messages sent by the user
      'readBy.user': { $ne: userId }
    }).select('chatId');

    // Group by chatId and count
    const unreadCounts = {};
    unreadMessages.forEach(message => {
      const chatId = message.chatId.toString();
      unreadCounts[chatId] = (unreadCounts[chatId] || 0) + 1;
    });

    // Convert to array format
    const result = Object.entries(unreadCounts).map(([chatId, count]) => ({
      _id: chatId,
      count: count
    }));

    return result;
  } catch (error) {
    console.error('getUnreadCount error:', error);
    return [];
  }
};

module.exports = mongoose.model('Message', messageSchema);


