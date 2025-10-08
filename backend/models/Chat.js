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
        },
        role: {
            type: String,
            enum: ['admin', 'member'],
            default: 'member'
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
        },
        allowReactions: {
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
    },
    // Chat metadata
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
        isArchived: {
            type: Boolean,
            default: false
        },
        archivedAt: Date,
        archivedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }
}, {
    timestamps: true
});

// Indexes for better performance
chatSchema.index({ companyId: 1, isActive: 1 });
chatSchema.index({ 'participants.user': 1 });
chatSchema.index({ companyId: 1, type: 1 });
chatSchema.index({ 'lastMessage.sentAt': -1 });

// Method to add participant
chatSchema.methods.addParticipant = function (userId, role = 'member') {
    const existingParticipant = this.participants.find(p => p.user.toString() === userId.toString());
    if (!existingParticipant) {
        this.participants.push({
            user: userId,
            joinedAt: new Date(),
            lastReadAt: new Date(),
            isActive: true,
            role: role
        });
    }
    return this.save();
};

// Method to remove participant
chatSchema.methods.removeParticipant = function (userId) {
    this.participants = this.participants.filter(p => p.user.toString() !== userId.toString());
    return this.save();
};

// Method to update last read time
chatSchema.methods.updateLastRead = function (userId) {
    const participant = this.participants.find(p => p.user.toString() === userId.toString());
    if (participant) {
        participant.lastReadAt = new Date();
        return this.save();
    }
    return Promise.resolve(this);
};

// Method to check if user is participant
chatSchema.methods.isParticipant = function (userId) {
    return this.participants.some(p => p.user.toString() === userId.toString() && p.isActive);
};

// Method to get unread count for user
chatSchema.methods.getUnreadCount = function (userId) {
    const participant = this.participants.find(p => p.user.toString() === userId.toString());
    if (!participant) return 0;

    // This will be calculated by the Message model
    return 0; // Placeholder - actual count calculated in Message.getUnreadCount
};

// Static method to get user's chats
chatSchema.statics.getUserChats = function (userId, companyId) {
    return this.find({
        companyId,
        isActive: true,
        'participants.user': userId,
        'participants.isActive': true,
        'metadata.isArchived': false
    })
        .populate('participants.user', 'name email avatar')
        .populate('createdBy', 'name email')
        .populate('lastMessage.sentBy', 'name email')
        .sort({ 'lastMessage.sentAt': -1, updatedAt: -1 });
};

// Static method to get or create direct chat
chatSchema.statics.getOrCreateDirectChat = function (user1Id, user2Id, companyId) {
    return this.findOne({
        companyId,
        type: 'direct',
        $and: [
            { 'participants.user': user1Id },
            { 'participants.user': user2Id }
        ]
    }).then(async (chat) => {
        if (chat) {
            return chat;
        }

        // Get user names for the chat
        const User = require('./User');
        const [user1, user2] = await Promise.all([
            User.findById(user1Id).select('name'),
            User.findById(user2Id).select('name')
        ]);

        // Create new direct chat with participant names
        return this.create({
            companyId,
            name: `${user1.name} & ${user2.name}`,
            type: 'direct',
            participants: [
                { user: user1Id, role: 'admin' },
                { user: user2Id, role: 'admin' }
            ],
            createdBy: user1Id
        });
    });
};

// Static method to create group chat
chatSchema.statics.createGroupChat = function (name, description, creatorId, participantIds, companyId) {
    const participants = [
        { user: creatorId, role: 'admin' },
        ...participantIds.map(id => ({ user: id, role: 'member' }))
    ];

    return this.create({
        companyId,
        name,
        type: 'group',
        description,
        participants,
        createdBy: creatorId
    });
};

module.exports = mongoose.model('Chat', chatSchema);
