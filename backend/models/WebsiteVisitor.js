const mongoose = require('mongoose');

const websiteVisitorSchema = new mongoose.Schema({
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    sessionId: {
        type: String,
        required: true
    },
    ipAddress: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        required: true
    },
    referrer: {
        type: String,
        trim: true
    },
    utmSource: {
        type: String,
        trim: true
    },
    utmMedium: {
        type: String,
        trim: true
    },
    utmCampaign: {
        type: String,
        trim: true
    },
    utmTerm: {
        type: String,
        trim: true
    },
    utmContent: {
        type: String,
        trim: true
    },
    landingPage: {
        type: String,
        required: true
    },
    pages: [{
        url: String,
        title: String,
        timestamp: {
            type: Date,
            default: Date.now
        },
        timeSpent: Number // in seconds
    }],
    totalTimeSpent: {
        type: Number,
        default: 0
    },
    pageViews: {
        type: Number,
        default: 1
    },
    isConverted: {
        type: Boolean,
        default: false
    },
    convertedAt: {
        type: Date
    },
    leadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead'
    },
    location: {
        country: String,
        region: String,
        city: String,
        latitude: Number,
        longitude: Number
    },
    device: {
        type: {
            type: String,
            enum: ['desktop', 'mobile', 'tablet']
        },
        os: String,
        browser: String
    },
    firstVisit: {
        type: Date,
        default: Date.now
    },
    lastVisit: {
        type: Date,
        default: Date.now
    },
    visitCount: {
        type: Number,
        default: 1
    }
}, {
    timestamps: true
});

// Index for better performance
websiteVisitorSchema.index({ companyId: 1, firstVisit: -1 });
websiteVisitorSchema.index({ sessionId: 1 });
websiteVisitorSchema.index({ isConverted: 1 });
websiteVisitorSchema.index({ utmSource: 1, utmCampaign: 1 });

module.exports = mongoose.model('WebsiteVisitor', websiteVisitorSchema);


