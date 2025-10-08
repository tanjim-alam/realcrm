const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    originalName: {
        type: String,
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number,
        required: true
    },
    filePath: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: [
            'contracts',
            'photos',
            'floor_plans',
            'inspection_reports',
            'marketing_materials',
            'tax_documents',
            'legal_documents',
            'insurance_documents',
            'appraisal_documents',
            'other'
        ],
        default: 'other'
    },
    description: {
        type: String,
        trim: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    isPublic: {
        type: Boolean,
        default: false
    },
    downloadCount: {
        type: Number,
        default: 0
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    relatedTo: {
        type: String,
        enum: ['lead', 'property', 'task', 'none'],
        default: 'none'
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    }
}, {
    timestamps: true
});

// Indexes for better performance
documentSchema.index({ companyId: 1, createdAt: -1 });
documentSchema.index({ companyId: 1, category: 1 });
documentSchema.index({ companyId: 1, uploadedBy: 1 });
documentSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Document', documentSchema);