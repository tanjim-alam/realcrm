const mongoose = require('mongoose');

const landingPageSchema = new mongoose.Schema({
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
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    template: {
        type: String,
        enum: ['hero', 'property-showcase', 'lead-magnet', 'contact', 'about', 'custom'],
        default: 'hero'
    },
    content: {
        hero: {
            title: String,
            subtitle: String,
            backgroundImage: String,
            ctaText: String,
            ctaLink: String,
            backgroundColor: String,
            textColor: String
        },
        sections: [{
            id: String,
            type: {
                type: String,
                enum: [
                    'hero', 'features', 'properties', 'testimonials', 'contact',
                    'lead-magnet', 'custom', 'text', 'image', 'video', 'cta',
                    'pricing', 'faq', 'team', 'stats', 'gallery', 'form', 'project-showcase'
                ]
            },
            title: String,
            subtitle: String,
            content: String,
            backgroundColor: String,
            textColor: String,
            padding: String,
            margin: String,
            properties: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Property'
            }],
            leadMagnet: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'LeadMagnet'
            },
            formConfig: {
                fields: [{
                    name: String,
                    type: {
                        type: String,
                        enum: ['text', 'email', 'tel', 'textarea', 'select', 'checkbox', 'radio', 'number', 'date']
                    },
                    label: String,
                    placeholder: String,
                    required: Boolean,
                    options: [String] // For select, radio, checkbox
                }],
                submitText: String,
                successMessage: String,
                redirectUrl: String
            },
            styling: {
                backgroundImage: String,
                backgroundPosition: String,
                backgroundSize: String,
                borderRadius: String,
                boxShadow: String,
                border: String
            },
            layout: {
                columns: Number,
                alignment: String,
                spacing: String
            },
            order: Number,
            isVisible: {
                type: Boolean,
                default: true
            },
            customHtml: String,
            customCss: String
        }],
        footer: {
            text: String,
            links: [{
                text: String,
                url: String
            }],
            socialLinks: [{
                platform: String,
                url: String,
                icon: String
            }],
            backgroundColor: String,
            textColor: String
        }
    },
    seo: {
        metaTitle: String,
        metaDescription: String,
        keywords: [String]
    },
    styling: {
        primaryColor: {
            type: String,
            default: '#3B82F6'
        },
        secondaryColor: {
            type: String,
            default: '#1E40AF'
        },
        fontFamily: {
            type: String,
            default: 'Inter'
        },
        customCss: String
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    views: {
        type: Number,
        default: 0
    },
    conversions: {
        type: Number,
        default: 0
    },
    conversionRate: {
        type: Number,
        default: 0
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
landingPageSchema.index({ companyId: 1, isActive: 1 });
landingPageSchema.index({ slug: 1 });
landingPageSchema.index({ isPublished: 1 });

module.exports = mongoose.model('LandingPage', landingPageSchema);

