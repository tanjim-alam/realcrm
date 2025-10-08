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
    enum: ['text', 'image', 'file', 'system', 'emoji', 'location'],
    default: 'text'
  },
  // For file messages
  file: {
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String,
    thumbnail: String
  },
  // For location messages
  location: {
    latitude: Number,
    longitude: Number,
    address: String
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
    },
    isForwarded: {
      type: Boolean,
      default: false
    },
    forwardedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    }
  },
  // Delivery status
  deliveryStatus: {
    sent: {
      type: Boolean,
      default: true
    },
    delivered: {
      type: Boolean,
      default: false
    },
    deliveredAt: Date,
    read: {
      type: Boolean,
      default: false
    },
    readAt: Date
  }
}, {
  timestamps: true
});

// Indexes for better performance
messageSchema.index({ chatId: 1, createdAt: -1 });
messageSchema.index({ companyId: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ 'readBy.user': 1 });
messageSchema.index({ 'deliveryStatus.delivered': 1 });
messageSchema.index({ 'deliveryStatus.read': 1 });

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
    
    // Update delivery status
    this.deliveryStatus.read = true;
    this.deliveryStatus.readAt = new Date();
    
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to mark as delivered
messageSchema.methods.markAsDelivered = function() {
  if (!this.deliveryStatus.delivered) {
    this.deliveryStatus.delivered = true;
    this.deliveryStatus.deliveredAt = new Date();
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
  .populate('sender', 'name email avatar')
  .populate('replyTo', 'content sender type')
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
      'participants.isActive': true,
      'metadata.isArchived': false
    }).select('_id participants');

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

// Static method to mark messages as delivered
messageSchema.statics.markAsDelivered = function(chatId, userId) {
  return this.updateMany(
    {
      chatId,
      sender: { $ne: userId },
      'deliveryStatus.delivered': false
    },
    {
      $set: {
        'deliveryStatus.delivered': true,
        'deliveryStatus.deliveredAt': new Date()
      }
    }
  );
};

// Static method to get message statistics
messageSchema.statics.getMessageStats = function(chatId, startDate, endDate) {
  const matchQuery = { chatId, isDeleted: false };
  
  if (startDate && endDate) {
    matchQuery.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalMessages: { $sum: 1 },
        textMessages: {
          $sum: { $cond: [{ $eq: ['$type', 'text'] }, 1, 0] }
        },
        fileMessages: {
          $sum: { $cond: [{ $eq: ['$type', 'file'] }, 1, 0] }
        },
        imageMessages: {
          $sum: { $cond: [{ $eq: ['$type', 'image'] }, 1, 0] }
        },
        avgReadTime: {
          $avg: {
            $cond: [
              { $gt: ['$deliveryStatus.readAt', null] },
              {
                $divide: [
                  { $subtract: ['$deliveryStatus.readAt', '$createdAt'] },
                  1000 * 60 // Convert to minutes
                ]
              },
              null
            ]
          }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Message', messageSchema);


