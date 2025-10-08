const mongoose = require('mongoose');

const leadMagnetSchema = new mongoose.Schema({
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
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['ebook', 'guide', 'checklist', 'template', 'calculator', 'video', 'webinar'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    thumbnail: {
        type: String,
        trim: true
    },
    downloadUrl: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    leadCount: {
        type: Number,
        default: 0
    },
    conversionRate: {
        type: Number,
        default: 0
    },
    formFields: [{
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
            enum: ['text', 'email', 'phone', 'select', 'textarea'],
            required: true
        },
        required: {
            type: Boolean,
            default: true
        },
        options: [String] // For select fields
    }],
    thankYouMessage: {
        type: String,
        default: 'Thank you for your interest! Your download will be available shortly.'
    },
    redirectUrl: {
        type: String,
        trim: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Index for better performance
leadMagnetSchema.index({ companyId: 1, isActive: 1 });
leadMagnetSchema.index({ type: 1 });

module.exports = mongoose.model('LeadMagnet', leadMagnetSchema);


