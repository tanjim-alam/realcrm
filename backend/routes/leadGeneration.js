const express = require('express');
const { body, validationResult } = require('express-validator');
const LeadMagnet = require('../models/LeadMagnet');
const LandingPage = require('../models/LandingPage');
const WebsiteVisitor = require('../models/WebsiteVisitor');
const Lead = require('../models/Lead');
const { authMiddleware } = require('../middleware/auth');
const notificationService = require('../services/notificationService');

const router = express.Router();

// Public routes (no auth required)
// @route   GET /api/lead-generation/lead-magnets/:id
// @desc    Get lead magnet by ID (public endpoint)
// @access  Public
router.get('/lead-magnets/:id', async (req, res) => {
    try {
        const leadMagnet = await LeadMagnet.findOne({
            _id: req.params.id,
            isActive: true
        });

        if (!leadMagnet) {
            return res.status(404).json({ message: 'Lead magnet not found' });
        }

        res.json(leadMagnet);
    } catch (error) {
        console.error('Get lead magnet error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/lead-generation/lead-magnets/:id/submit
// @desc    Submit lead magnet form (public endpoint)
// @access  Public
router.post('/lead-magnets/:id/submit', [
    body('email').isEmail().withMessage('Valid email is required'),
    body('name').notEmpty().withMessage('Name is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const leadMagnet = await LeadMagnet.findById(req.params.id);
        if (!leadMagnet || !leadMagnet.isActive) {
            return res.status(404).json({ message: 'Lead magnet not found' });
        }

        // Create lead from form submission
        const leadData = {
            companyId: leadMagnet.companyId,
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone || '',
            source: 'lead_magnet',
            notes: `Lead generated from: ${leadMagnet.title}`,
            customFields: {
                leadMagnetId: leadMagnet._id,
                leadMagnetType: leadMagnet.type,
                formData: req.body
            },
            createdBy: leadMagnet.createdBy
        };

        const lead = new Lead(leadData);
        await lead.save();

        // Update lead magnet stats
        leadMagnet.leadCount += 1;
        await leadMagnet.save();

        // Send notification
        try {
            await notificationService.createLeadNotification(lead, 'lead_magnet');
        } catch (notificationError) {
            console.error('Failed to send lead notification:', notificationError);
        }

        res.json({
            message: 'Thank you! Your download will be available shortly.',
            downloadUrl: leadMagnet.downloadUrl,
            redirectUrl: leadMagnet.redirectUrl
        });
    } catch (error) {
        console.error('Submit lead magnet error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/lead-generation/landing-pages/:slug
// @desc    Get landing page by slug (public endpoint)
// @access  Public
router.get('/landing-pages/:slug', async (req, res) => {
    try {
        const landingPage = await LandingPage.findOne({
            slug: req.params.slug,
            isPublished: true,
            isActive: true
        })
            .populate('content.sections.properties')
            .populate('content.sections.leadMagnet');

        if (!landingPage) {
            return res.status(404).json({ message: 'Landing page not found' });
        }

        // Track page view
        landingPage.views += 1;
        await landingPage.save();

        res.json(landingPage);
    } catch (error) {
        console.error('Get landing page error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/lead-generation/track-visitor
// @desc    Track website visitor (public endpoint)
// @access  Public
router.post('/track-visitor', [
    body('companyId').isMongoId().withMessage('Valid company ID is required'),
    body('sessionId').notEmpty().withMessage('Session ID is required'),
    body('ipAddress').notEmpty().withMessage('IP address is required'),
    body('landingPage').notEmpty().withMessage('Landing page is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const visitorData = {
            ...req.body,
            userAgent: req.get('User-Agent'),
            referrer: req.get('Referer')
        };

        // Check if visitor already exists
        let visitor = await WebsiteVisitor.findOne({
            companyId: req.body.companyId,
            sessionId: req.body.sessionId
        });

        if (visitor) {
            // Update existing visitor
            visitor.lastVisit = new Date();
            visitor.visitCount += 1;
            visitor.pages.push({
                url: req.body.landingPage,
                title: req.body.pageTitle || '',
                timestamp: new Date(),
                timeSpent: req.body.timeSpent || 0
            });
            visitor.pageViews += 1;
            visitor.totalTimeSpent += req.body.timeSpent || 0;
        } else {
            // Create new visitor
            visitor = new WebsiteVisitor(visitorData);
        }

        await visitor.save();
        res.json({ success: true });
    } catch (error) {
        console.error('Track visitor error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Apply auth middleware to remaining routes
router.use(authMiddleware);

// ==================== LEAD MAGNETS ====================

// @route   GET /api/lead-generation/lead-magnets
// @desc    Get all lead magnets for the company
// @access  Private
router.get('/lead-magnets', async (req, res) => {
    try {
        const leadMagnets = await LeadMagnet.find({
            companyId: req.user.companyId,
            isActive: true
        })
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });

        res.json(leadMagnets);
    } catch (error) {
        console.error('Get lead magnets error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/lead-generation/lead-magnets
// @desc    Create new lead magnet
// @access  Private
router.post('/lead-magnets', [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('type').isIn(['ebook', 'guide', 'checklist', 'template', 'calculator', 'video', 'webinar']).withMessage('Invalid type'),
    body('content').notEmpty().withMessage('Content is required'),
    body('formFields').isArray().withMessage('Form fields must be an array')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const leadMagnet = new LeadMagnet({
            ...req.body,
            companyId: req.user.companyId,
            createdBy: req.user.id
        });

        await leadMagnet.save();
        res.status(201).json(leadMagnet);
    } catch (error) {
        console.error('Create lead magnet error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/lead-generation/lead-magnets/:id
// @desc    Update lead magnet
// @access  Private
router.put('/lead-magnets/:id', [
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('description').optional().notEmpty().withMessage('Description cannot be empty'),
    body('type').optional().isIn(['ebook', 'guide', 'checklist', 'template', 'calculator', 'video', 'webinar']).withMessage('Invalid type')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const leadMagnet = await LeadMagnet.findOneAndUpdate(
            { _id: req.params.id, companyId: req.user.companyId },
            req.body,
            { new: true, runValidators: true }
        );

        if (!leadMagnet) {
            return res.status(404).json({ message: 'Lead magnet not found' });
        }

        res.json(leadMagnet);
    } catch (error) {
        console.error('Update lead magnet error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/lead-generation/lead-magnets/:id
// @desc    Delete lead magnet
// @access  Private
router.delete('/lead-magnets/:id', async (req, res) => {
    try {
        const leadMagnet = await LeadMagnet.findOneAndUpdate(
            { _id: req.params.id, companyId: req.user.companyId },
            { isActive: false },
            { new: true }
        );

        if (!leadMagnet) {
            return res.status(404).json({ message: 'Lead magnet not found' });
        }

        res.json({ message: 'Lead magnet deleted successfully' });
    } catch (error) {
        console.error('Delete lead magnet error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// ==================== LANDING PAGES ====================

// @route   GET /api/lead-generation/landing-pages
// @desc    Get all landing pages for the company
// @access  Private
router.get('/landing-pages', async (req, res) => {
    try {
        const landingPages = await LandingPage.find({
            companyId: req.user.companyId,
            isActive: true
        })
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });

        res.json(landingPages);
    } catch (error) {
        console.error('Get landing pages error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/lead-generation/landing-pages
// @desc    Create new landing page
// @access  Private
router.post('/landing-pages', [
    body('title').notEmpty().withMessage('Title is required'),
    body('slug').notEmpty().withMessage('Slug is required'),
    body('template').isIn(['hero', 'property-showcase', 'lead-magnet', 'contact', 'about', 'custom']).withMessage('Invalid template')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Check if slug already exists
        const existingPage = await LandingPage.findOne({ slug: req.body.slug });
        if (existingPage) {
            return res.status(400).json({ message: 'Slug already exists' });
        }

        const landingPage = new LandingPage({
            ...req.body,
            companyId: req.user.companyId,
            createdBy: req.user.id
        });

        await landingPage.save();
        res.status(201).json(landingPage);
    } catch (error) {
        console.error('Create landing page error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// @route   PUT /api/lead-generation/landing-pages/:id
// @desc    Update landing page
// @access  Private
router.put('/landing-pages/:id', [
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('slug').optional().notEmpty().withMessage('Slug cannot be empty')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const landingPage = await LandingPage.findOneAndUpdate(
            { _id: req.params.id, companyId: req.user.companyId },
            req.body,
            { new: true, runValidators: true }
        );

        if (!landingPage) {
            return res.status(404).json({ message: 'Landing page not found' });
        }

        res.json(landingPage);
    } catch (error) {
        console.error('Update landing page error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/lead-generation/landing-pages/:id
// @desc    Delete landing page
// @access  Private
router.delete('/landing-pages/:id', async (req, res) => {
    try {
        const landingPage = await LandingPage.findOneAndUpdate(
            { _id: req.params.id, companyId: req.user.companyId },
            { isActive: false },
            { new: true }
        );

        if (!landingPage) {
            return res.status(404).json({ message: 'Landing page not found' });
        }

        res.json({ message: 'Landing page deleted successfully' });
    } catch (error) {
        console.error('Delete landing page error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/lead-generation/landing-pages/:id/sections
// @desc    Add section to landing page
// @access  Private
router.post('/landing-pages/:id/sections', [
    body('type').notEmpty().withMessage('Section type is required'),
    body('title').optional().notEmpty().withMessage('Title cannot be empty')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const landingPage = await LandingPage.findOne({
            _id: req.params.id,
            companyId: req.user.companyId
        });

        if (!landingPage) {
            return res.status(404).json({ message: 'Landing page not found' });
        }

        const newSection = {
            id: req.body.id || require('crypto').randomUUID(),
            type: req.body.type,
            title: req.body.title || '',
            subtitle: req.body.subtitle || '',
            content: req.body.content || '',
            backgroundColor: req.body.backgroundColor || 'transparent',
            textColor: req.body.textColor || '#1E293B',
            padding: req.body.padding || '2rem 0',
            margin: req.body.margin || '0',
            order: landingPage.content.sections.length,
            isVisible: req.body.isVisible !== false,
            styling: req.body.styling || {},
            layout: req.body.layout || {
                columns: 3,
                alignment: 'center',
                spacing: 'normal'
            }
        };

        landingPage.content.sections.push(newSection);
        await landingPage.save();

        res.json(newSection);
    } catch (error) {
        console.error('Add section error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/lead-generation/landing-pages/:id/sections/:sectionId
// @desc    Update section in landing page
// @access  Private
router.put('/landing-pages/:id/sections/:sectionId', async (req, res) => {
    try {
        const landingPage = await LandingPage.findOne({
            _id: req.params.id,
            companyId: req.user.companyId
        });

        if (!landingPage) {
            return res.status(404).json({ message: 'Landing page not found' });
        }

        const sectionIndex = landingPage.content.sections.findIndex(
            section => section.id === req.params.sectionId
        );

        if (sectionIndex === -1) {
            return res.status(404).json({ message: 'Section not found' });
        }

        // Update section with new data
        landingPage.content.sections[sectionIndex] = {
            ...landingPage.content.sections[sectionIndex],
            ...req.body
        };

        await landingPage.save();

        res.json(landingPage.content.sections[sectionIndex]);
    } catch (error) {
        console.error('Update section error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/lead-generation/landing-pages/:id/sections/:sectionId
// @desc    Delete section from landing page
// @access  Private
router.delete('/landing-pages/:id/sections/:sectionId', async (req, res) => {
    try {
        const landingPage = await LandingPage.findOne({
            _id: req.params.id,
            companyId: req.user.companyId
        });

        if (!landingPage) {
            return res.status(404).json({ message: 'Landing page not found' });
        }

        const sectionIndex = landingPage.content.sections.findIndex(
            section => section.id === req.params.sectionId
        );

        if (sectionIndex === -1) {
            return res.status(404).json({ message: 'Section not found' });
        }

        landingPage.content.sections.splice(sectionIndex, 1);

        // Reorder remaining sections
        landingPage.content.sections.forEach((section, index) => {
            section.order = index;
        });

        await landingPage.save();

        res.json({ message: 'Section deleted successfully' });
    } catch (error) {
        console.error('Delete section error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/lead-generation/landing-pages/:id/sections/reorder
// @desc    Reorder sections in landing page
// @access  Private
router.put('/landing-pages/:id/sections/reorder', [
    body('sections').isArray().withMessage('Sections must be an array')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const landingPage = await LandingPage.findOne({
            _id: req.params.id,
            companyId: req.user.companyId
        });

        if (!landingPage) {
            return res.status(404).json({ message: 'Landing page not found' });
        }

        // Update section order
        landingPage.content.sections = req.body.sections.map((section, index) => ({
            ...section,
            order: index
        }));

        await landingPage.save();

        res.json({ message: 'Sections reordered successfully' });
    } catch (error) {
        console.error('Reorder sections error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ==================== WEBSITE VISITORS ====================

// @route   POST /api/lead-generation/track-visitor
// @desc    Track website visitor (public endpoint)
// @access  Public
router.post('/track-visitor', [
    body('companyId').isMongoId().withMessage('Valid company ID is required'),
    body('sessionId').notEmpty().withMessage('Session ID is required'),
    body('ipAddress').notEmpty().withMessage('IP address is required'),
    body('landingPage').notEmpty().withMessage('Landing page is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const visitorData = {
            ...req.body,
            userAgent: req.get('User-Agent'),
            referrer: req.get('Referer')
        };

        // Check if visitor already exists
        let visitor = await WebsiteVisitor.findOne({
            companyId: req.body.companyId,
            sessionId: req.body.sessionId
        });

        if (visitor) {
            // Update existing visitor
            visitor.lastVisit = new Date();
            visitor.visitCount += 1;
            visitor.pages.push({
                url: req.body.landingPage,
                title: req.body.pageTitle || '',
                timestamp: new Date(),
                timeSpent: req.body.timeSpent || 0
            });
            visitor.pageViews += 1;
            visitor.totalTimeSpent += req.body.timeSpent || 0;
        } else {
            // Create new visitor
            visitor = new WebsiteVisitor(visitorData);
        }

        await visitor.save();
        res.json({ success: true });
    } catch (error) {
        console.error('Track visitor error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/lead-generation/visitors
// @desc    Get website visitors for the company
// @access  Private
router.get('/visitors', async (req, res) => {
    try {
        const { page = 1, limit = 50, dateFrom, dateTo } = req.query;

        const filter = { companyId: req.user.companyId };

        if (dateFrom || dateTo) {
            filter.firstVisit = {};
            if (dateFrom) filter.firstVisit.$gte = new Date(dateFrom);
            if (dateTo) filter.firstVisit.$lte = new Date(dateTo);
        }

        const visitors = await WebsiteVisitor.find(filter)
            .sort({ firstVisit: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await WebsiteVisitor.countDocuments(filter);

        res.json({
            visitors,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error('Get visitors error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/lead-generation/analytics
// @desc    Get lead generation analytics
// @access  Private
router.get('/analytics', async (req, res) => {
    try {
        const { dateFrom, dateTo } = req.query;

        const matchCriteria = { companyId: req.user.companyId };

        if (dateFrom || dateTo) {
            matchCriteria.createdAt = {};
            if (dateFrom) matchCriteria.createdAt.$gte = new Date(dateFrom);
            if (dateTo) matchCriteria.createdAt.$lte = new Date(dateTo);
        }

        // Lead magnets analytics
        const leadMagnets = await LeadMagnet.find({
            companyId: req.user.companyId,
            isActive: true
        });

        // Landing pages analytics
        const landingPages = await LandingPage.find({
            companyId: req.user.companyId,
            isActive: true
        });

        // Visitors analytics
        const visitors = await WebsiteVisitor.find(matchCriteria);
        const convertedVisitors = visitors.filter(v => v.isConverted);

        // Lead source analytics
        const leadSources = await Lead.aggregate([
            { $match: { ...matchCriteria, source: 'lead_magnet' } },
            {
                $group: {
                    _id: '$customFields.leadMagnetId',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        res.json({
            leadMagnets: {
                total: leadMagnets.length,
                totalLeads: leadMagnets.reduce((sum, lm) => sum + lm.leadCount, 0),
                topPerforming: leadMagnets.sort((a, b) => b.leadCount - a.leadCount).slice(0, 5)
            },
            landingPages: {
                total: landingPages.length,
                totalViews: landingPages.reduce((sum, lp) => sum + lp.views, 0),
                totalConversions: landingPages.reduce((sum, lp) => sum + lp.conversions, 0),
                topPerforming: landingPages.sort((a, b) => b.views - a.views).slice(0, 5)
            },
            visitors: {
                total: visitors.length,
                converted: convertedVisitors.length,
                conversionRate: visitors.length > 0 ? (convertedVisitors.length / visitors.length * 100).toFixed(2) : 0,
                averageTimeSpent: visitors.length > 0 ?
                    (visitors.reduce((sum, v) => sum + v.totalTimeSpent, 0) / visitors.length / 60).toFixed(2) : 0
            },
            leadSources
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
