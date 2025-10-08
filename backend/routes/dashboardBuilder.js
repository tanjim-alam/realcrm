const express = require('express');
const { body, validationResult } = require('express-validator');
const DashboardWidget = require('../models/DashboardWidget');
const Lead = require('../models/Lead');
const Property = require('../models/Property');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// @route   GET /api/dashboard-builder/widgets
// @desc    Get all dashboard widgets for the user
// @access  Private
router.get('/widgets', async (req, res) => {
    try {
        const widgets = await DashboardWidget.find({
            companyId: req.user.companyId,
            userId: req.user.id,
            isVisible: true
        }).sort({ order: 1 });

        res.json(widgets);
    } catch (error) {
        console.error('Get widgets error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/dashboard-builder/widgets
// @desc    Create new dashboard widget
// @access  Private
router.post('/widgets', [
    body('name').notEmpty().withMessage('Name is required'),
    body('type').isIn([
        'leads_count', 'properties_count', 'conversion_rate', 'revenue',
        'leads_chart', 'properties_chart', 'conversion_funnel', 'top_agents',
        'recent_leads', 'recent_properties', 'lead_sources', 'property_types',
        'monthly_trends', 'custom_query'
    ]).withMessage('Invalid widget type'),
    body('position').isObject().withMessage('Position is required'),
    body('config').isObject().withMessage('Config is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const widget = new DashboardWidget({
            ...req.body,
            companyId: req.user.companyId,
            userId: req.user.id
        });

        await widget.save();
        res.status(201).json(widget);
    } catch (error) {
        console.error('Create widget error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/dashboard-builder/widgets/:id
// @desc    Update dashboard widget
// @access  Private
router.put('/widgets/:id', [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('position').optional().isObject().withMessage('Position must be an object'),
    body('config').optional().isObject().withMessage('Config must be an object')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const widget = await DashboardWidget.findOneAndUpdate(
            { _id: req.params.id, companyId: req.user.companyId, userId: req.user.id },
            req.body,
            { new: true, runValidators: true }
        );

        if (!widget) {
            return res.status(404).json({ message: 'Widget not found' });
        }

        res.json(widget);
    } catch (error) {
        console.error('Update widget error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/dashboard-builder/widgets/:id
// @desc    Delete dashboard widget
// @access  Private
router.delete('/widgets/:id', async (req, res) => {
    try {
        const widget = await DashboardWidget.findOneAndDelete({
            _id: req.params.id,
            companyId: req.user.companyId,
            userId: req.user.id
        });

        if (!widget) {
            return res.status(404).json({ message: 'Widget not found' });
        }

        res.json({ message: 'Widget deleted successfully' });
    } catch (error) {
        console.error('Delete widget error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/dashboard-builder/widgets/reorder
// @desc    Reorder dashboard widgets
// @access  Private
router.put('/widgets/reorder', [
    body('widgets').isArray().withMessage('Widgets must be an array')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { widgets } = req.body;

        // Update order for each widget
        const updatePromises = widgets.map((widget, index) =>
            DashboardWidget.findOneAndUpdate(
                { _id: widget.id, companyId: req.user.companyId, userId: req.user.id },
                { order: index, position: widget.position },
                { new: true }
            )
        );

        await Promise.all(updatePromises);
        res.json({ message: 'Widgets reordered successfully' });
    } catch (error) {
        console.error('Reorder widgets error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/dashboard-builder/widgets/:id/data
// @desc    Get widget data
// @access  Private
router.get('/widgets/:id/data', async (req, res) => {
    try {
        const widget = await DashboardWidget.findOne({
            _id: req.params.id,
            companyId: req.user.companyId,
            userId: req.user.id
        });

        if (!widget) {
            return res.status(404).json({ message: 'Widget not found' });
        }

        const data = await getWidgetData(widget, req.user);
        res.json(data);
    } catch (error) {
        console.error('Get widget data error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Helper function to get widget data
async function getWidgetData(widget, user) {
    const { type, config } = widget;
    const { dateRange, customDateRange, filters = {} } = config;

    // Build date filter
    let dateFilter = {};
    if (dateRange === 'custom' && customDateRange) {
        dateFilter = {
            createdAt: {
                $gte: customDateRange.start,
                $lte: customDateRange.end
            }
        };
    } else {
        dateFilter = getDateFilter(dateRange);
    }

    // Build base filter
    const baseFilter = {
        companyId: user.companyId,
        ...dateFilter
    };

    // Add role-based filters
    if (user.role === 'agent') {
        baseFilter.assignedTo = user.id;
    }

    // Add custom filters
    if (filters.leadStatus && filters.leadStatus.length > 0) {
        baseFilter.status = { $in: filters.leadStatus };
    }
    if (filters.assignedTo && filters.assignedTo.length > 0) {
        baseFilter.assignedTo = { $in: filters.assignedTo };
    }
    if (filters.leadSource && filters.leadSource.length > 0) {
        baseFilter.source = { $in: filters.leadSource };
    }

    switch (type) {
        case 'leads_count':
            const leadsCount = await Lead.countDocuments(baseFilter);
            return { count: leadsCount };

        case 'properties_count':
            const propertiesFilter = { ...baseFilter };
            if (filters.propertyType && filters.propertyType.length > 0) {
                propertiesFilter.propertyType = { $in: filters.propertyType };
            }
            const propertiesCount = await Property.countDocuments(propertiesFilter);
            return { count: propertiesCount };

        case 'conversion_rate':
            const totalLeads = await Lead.countDocuments(baseFilter);
            const convertedLeads = await Lead.countDocuments({
                ...baseFilter,
                status: 'closed'
            });
            const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads * 100).toFixed(2) : 0;
            return { rate: conversionRate, total: totalLeads, converted: convertedLeads };

        case 'revenue':
            const revenueLeads = await Lead.find({
                ...baseFilter,
                status: 'closed'
            }).populate('propertyId', 'price');

            const totalRevenue = revenueLeads.reduce((sum, lead) => {
                if (lead.propertyId && lead.propertyId.price) {
                    return sum + (lead.propertyId.price.value || 0);
                }
                return sum;
            }, 0);

            return { revenue: totalRevenue };

        case 'leads_chart':
            const leadsChartData = await getLeadsChartData(baseFilter, config.chartType);
            return leadsChartData;

        case 'properties_chart':
            const propertiesChartData = await getPropertiesChartData(baseFilter, config.chartType);
            return propertiesChartData;

        case 'conversion_funnel':
            const funnelData = await getConversionFunnelData(baseFilter);
            return funnelData;

        case 'top_agents':
            const topAgentsData = await getTopAgentsData(baseFilter);
            return topAgentsData;

        case 'recent_leads':
            const recentLeads = await Lead.find(baseFilter)
                .populate('assignedTo', 'name')
                .populate('propertyId', 'title')
                .sort({ createdAt: -1 })
                .limit(10);
            return { leads: recentLeads };

        case 'recent_properties':
            const recentProperties = await Property.find(baseFilter)
                .populate('listedBy', 'name')
                .sort({ createdAt: -1 })
                .limit(10);
            return { properties: recentProperties };

        case 'lead_sources':
            const leadSourcesData = await getLeadSourcesData(baseFilter);
            return leadSourcesData;

        case 'property_types':
            const propertyTypesData = await getPropertyTypesData(baseFilter);
            return propertyTypesData;

        case 'monthly_trends':
            const monthlyTrendsData = await getMonthlyTrendsData(baseFilter);
            return monthlyTrendsData;

        default:
            return { message: 'Widget type not supported' };
    }
}

// Helper functions for different chart types
async function getLeadsChartData(filter, chartType) {
    const pipeline = [
        { $match: filter },
        {
            $group: {
                _id: {
                    $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ];

    const data = await Lead.aggregate(pipeline);
    return {
        labels: data.map(item => item._id),
        datasets: [{
            label: 'Leads',
            data: data.map(item => item.count),
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 2
        }]
    };
}

async function getPropertiesChartData(filter, chartType) {
    const pipeline = [
        { $match: filter },
        {
            $group: {
                _id: '$propertyType',
                count: { $sum: 1 }
            }
        }
    ];

    const data = await Property.aggregate(pipeline);
    return {
        labels: data.map(item => item._id),
        datasets: [{
            data: data.map(item => item.count),
            backgroundColor: [
                'rgba(59, 130, 246, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(239, 68, 68, 0.8)',
                'rgba(139, 92, 246, 0.8)'
            ]
        }]
    };
}

async function getConversionFunnelData(filter) {
    const stages = [
        { name: 'New Leads', status: 'new' },
        { name: 'Contacted', status: 'contacted' },
        { name: 'Visited', status: 'visit' },
        { name: 'Offered', status: 'offer' },
        { name: 'Closed', status: 'closed' }
    ];

    const data = await Promise.all(
        stages.map(async (stage) => {
            const count = await Lead.countDocuments({
                ...filter,
                status: stage.status
            });
            return { name: stage.name, value: count };
        })
    );

    return data;
}

async function getTopAgentsData(filter) {
    const pipeline = [
        { $match: filter },
        {
            $group: {
                _id: '$assignedTo',
                leadsCount: { $sum: 1 },
                closedLeads: {
                    $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] }
                }
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'agent'
            }
        },
        { $unwind: '$agent' },
        {
            $project: {
                name: '$agent.name',
                email: '$agent.email',
                leadsCount: 1,
                closedLeads: 1,
                conversionRate: {
                    $multiply: [
                        { $divide: ['$closedLeads', '$leadsCount'] },
                        100
                    ]
                }
            }
        },
        { $sort: { leadsCount: -1 } },
        { $limit: 10 }
    ];

    const data = await Lead.aggregate(pipeline);
    return data;
}

async function getLeadSourcesData(filter) {
    const pipeline = [
        { $match: filter },
        {
            $group: {
                _id: '$source',
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } }
    ];

    const data = await Lead.aggregate(pipeline);
    return {
        labels: data.map(item => item._id || 'Unknown'),
        datasets: [{
            data: data.map(item => item.count),
            backgroundColor: [
                'rgba(59, 130, 246, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(239, 68, 68, 0.8)',
                'rgba(139, 92, 246, 0.8)'
            ]
        }]
    };
}

async function getPropertyTypesData(filter) {
    const pipeline = [
        { $match: filter },
        {
            $group: {
                _id: '$propertyType',
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } }
    ];

    const data = await Property.aggregate(pipeline);
    return {
        labels: data.map(item => item._id),
        datasets: [{
            data: data.map(item => item.count),
            backgroundColor: [
                'rgba(59, 130, 246, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(239, 68, 68, 0.8)',
                'rgba(139, 92, 246, 0.8)'
            ]
        }]
    };
}

async function getMonthlyTrendsData(filter) {
    const pipeline = [
        { $match: filter },
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' }
                },
                count: { $sum: 1 }
            }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
    ];

    const data = await Lead.aggregate(pipeline);
    return {
        labels: data.map(item => `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`),
        datasets: [{
            label: 'Leads',
            data: data.map(item => item.count),
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 2
        }]
    };
}

function getDateFilter(dateRange) {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    switch (dateRange) {
        case 'today':
            return { createdAt: { $gte: startOfDay, $lt: endOfDay } };
        case 'yesterday':
            const yesterdayStart = new Date(startOfDay);
            yesterdayStart.setDate(yesterdayStart.getDate() - 1);
            const yesterdayEnd = new Date(endOfDay);
            yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
            return { createdAt: { $gte: yesterdayStart, $lt: yesterdayEnd } };
        case 'this_week':
            const startOfWeek = new Date(startOfDay);
            startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
            return { createdAt: { $gte: startOfWeek } };
        case 'last_week':
            const lastWeekStart = new Date(startOfDay);
            lastWeekStart.setDate(startOfDay.getDate() - startOfDay.getDay() - 7);
            const lastWeekEnd = new Date(startOfDay);
            lastWeekEnd.setDate(startOfDay.getDate() - startOfDay.getDay());
            return { createdAt: { $gte: lastWeekStart, $lt: lastWeekEnd } };
        case 'this_month':
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            return { createdAt: { $gte: startOfMonth } };
        case 'last_month':
            const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);
            return { createdAt: { $gte: lastMonthStart, $lt: lastMonthEnd } };
        case 'this_year':
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            return { createdAt: { $gte: startOfYear } };
        case 'last_year':
            const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
            const lastYearEnd = new Date(now.getFullYear(), 0, 1);
            return { createdAt: { $gte: lastYearStart, $lt: lastYearEnd } };
        default:
            return {};
    }
}

module.exports = router;


