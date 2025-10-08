const mongoose = require('mongoose');

const dashboardWidgetSchema = new mongoose.Schema({
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: [
            'leads_count',
            'properties_count',
            'conversion_rate',
            'revenue',
            'leads_chart',
            'properties_chart',
            'conversion_funnel',
            'top_agents',
            'recent_leads',
            'recent_properties',
            'lead_sources',
            'property_types',
            'monthly_trends',
            'custom_query'
        ],
        required: true
    },
    position: {
        x: { type: Number, required: true },
        y: { type: Number, required: true },
        w: { type: Number, required: true },
        h: { type: Number, required: true }
    },
    config: {
        title: String,
        description: String,
        chartType: {
            type: String,
            enum: ['line', 'bar', 'pie', 'doughnut', 'area', 'scatter'],
            default: 'line'
        },
        dateRange: {
            type: String,
            enum: ['today', 'yesterday', 'this_week', 'last_week', 'this_month', 'last_month', 'this_year', 'last_year', 'custom'],
            default: 'this_month'
        },
        customDateRange: {
            start: Date,
            end: Date
        },
        filters: {
            leadStatus: [String],
            propertyType: [String],
            assignedTo: [String],
            leadSource: [String]
        },
        query: String, // For custom query widget
        refreshInterval: {
            type: Number,
            default: 300 // 5 minutes in seconds
        },
        showDataLabels: {
            type: Boolean,
            default: true
        },
        showLegend: {
            type: Boolean,
            default: true
        },
        colors: [String]
    },
    isVisible: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index for better performance
dashboardWidgetSchema.index({ companyId: 1, userId: 1 });
dashboardWidgetSchema.index({ type: 1 });

module.exports = mongoose.model('DashboardWidget', dashboardWidgetSchema);


