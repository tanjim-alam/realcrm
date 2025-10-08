const express = require('express');
const { body, validationResult } = require('express-validator');
const Lead = require('../models/Lead');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const { authMiddleware } = require('../middleware/auth');
const notificationService = require('../services/notificationService');

const router = express.Router();

// @route   POST /api/webhooks/leads
// @desc    Create lead from external source (landing page, ads, etc.)
// @access  Public (with API key validation)
router.post('/leads', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('propertyId').optional().isMongoId().withMessage('Property ID must be a valid MongoDB ObjectId'),
  body('companyId').notEmpty().withMessage('Company ID is required'),
  body('source').notEmpty().withMessage('Lead source is required'),
  body('apiKey').notEmpty().withMessage('API key is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, propertyId, companyId, source, apiKey, propertyType, location, notes, ...additionalFields } = req.body;
    console.log("apiKey", apiKey);
    console.log("process.env.WEBHOOK_API_KEY", process.env.WEBHOOK_API_KEY);
    // Validate API key (shared across all companies)
    if (apiKey !== process.env.WEBHOOK_API_KEY) {
      return res.status(401).json({ message: 'Invalid API key' });
    }

    // Check if company exists and is active
    const Company = require('../models/Company');
    const company = await Company.findById(companyId);
    if (!company || !company.isActive) {
      return res.status(404).json({ message: 'Company not found or inactive' });
    }

    // Check subscription limits
    const subscription = await Subscription.findOne({ companyId });
    const leadCount = await Lead.countDocuments({ companyId });

    console.log('🔍 Webhook - Company ID:', companyId);
    console.log('🔍 Webhook - Lead count:', leadCount);
    console.log('🔍 Webhook - Subscription found:', !!subscription);
    if (subscription) {
      console.log('🔍 Webhook - Subscription plan:', subscription.plan);
      console.log('🔍 Webhook - Max leads:', subscription.features.maxLeads);
      console.log('🔍 Webhook - Features:', subscription.features);
    }

    console.log('🔍 Webhook - Limit check:', {
      hasSubscription: !!subscription,
      maxLeadsNotUnlimited: subscription?.features?.maxLeads !== -1,
      leadCount: leadCount,
      maxLeads: subscription?.features?.maxLeads,
      shouldBlock: subscription && subscription.features.maxLeads !== -1 && leadCount >= subscription.features.maxLeads
    });

    if (subscription && subscription.features.maxLeads !== -1 && leadCount >= subscription.features.maxLeads) {
      console.log('❌ Webhook - Lead limit reached!', {
        currentLeads: leadCount,
        maxLeads: subscription.features.maxLeads,
        plan: subscription.plan
      });
      return res.status(403).json({
        message: 'Lead limit reached. Please upgrade your plan to add more leads.'
      });
    }

    // Find any admin user for createdBy field (required by Lead model)
    const adminUser = await User.findOne({
      companyId,
      role: 'admin'
    }).select('_id');

    // Process custom fields from additional data
    const customFields = {};
    Object.entries(additionalFields).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        customFields[key] = {
          label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
          value: value,
          type: typeof value === 'number' ? 'number' :
            typeof value === 'boolean' ? 'boolean' :
              value instanceof Date ? 'date' : 'text'
        };
      }
    });

    // Create lead (unassigned by default)
    const leadData = {
      companyId,
      name,
      email,
      phone,
      propertyId: propertyId || undefined,
      propertyType: propertyType || 'apartment',
      status: 'new',
      source,
      location,
      notes,
      customFields,
      assignedTo: null, // Unassigned by default
      createdBy: adminUser?._id, // Use admin user for createdBy (required field)
      createdAt: new Date()
    };

    const lead = new Lead(leadData);
    await lead.save();

    // Send notification email (only if admin user exists)
    try {
      console.log('🔔 Webhook: Creating lead notification for:', lead.name);
      console.log('👤 Webhook: Lead is unassigned');

      if (adminUser) {
        console.log('👤 Webhook: Sending notification to admin:', adminUser.name);

        // Create a lead object with admin as the target for notification
        const leadForNotification = {
          ...lead.toObject(),
          assignedTo: adminUser._id,
          createdBy: adminUser._id
        };

        await notificationService.createLeadNotification(leadForNotification, 'webhook');
        console.log('✅ Webhook lead notification sent successfully to admin');
      } else {
        console.log('⚠️ No admin user found, skipping notification');
      }
    } catch (notificationError) {
      console.error('❌ Failed to send webhook lead notification:', notificationError);
      // Don't fail the lead creation if notification fails
    }

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      leadId: lead._id
    });
  } catch (error) {
    console.error('Webhook lead creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/webhooks/leads/bulk
// @desc    Bulk import leads from external sources
// @access  Public (with API key validation)
router.post('/leads/bulk', [
  body('leads').isArray().withMessage('Leads must be an array'),
  body('companyId').notEmpty().withMessage('Company ID is required'),
  body('apiKey').notEmpty().withMessage('API key is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { leads, companyId, apiKey } = req.body;

    // Validate API key
    if (apiKey !== process.env.WEBHOOK_API_KEY) {
      return res.status(401).json({ message: 'Invalid API key' });
    }

    // Check if company exists
    const Company = require('../models/Company');
    const company = await Company.findById(companyId);
    if (!company || !company.isActive) {
      return res.status(404).json({ message: 'Company not found or inactive' });
    }

    // Find a default user for bulk-created leads
    const defaultUser = await User.findOne({ companyId }).select('_id');
    if (!defaultUser) {
      return res.status(400).json({ message: 'No users found in company' });
    }

    // Check subscription limits
    const subscription = await Subscription.findOne({ companyId });
    const currentLeadCount = await Lead.countDocuments({ companyId });

    if (subscription && subscription.features.maxLeads !== -1 &&
      (currentLeadCount + leads.length) > subscription.features.maxLeads) {
      return res.status(403).json({
        message: 'Bulk import would exceed lead limit. Please upgrade your plan.'
      });
    }

    // Process leads
    const processedLeads = [];
    const importErrors = [];

    for (let i = 0; i < leads.length; i++) {
      const leadData = leads[i];

      try {
        // Validate required fields
        if (!leadData.name || !leadData.email) {
          importErrors.push(`Lead ${i + 1}: Name and email are required`);
          continue;
        }

        // Check for duplicate email
        const existingLead = await Lead.findOne({
          email: leadData.email,
          companyId
        });

        if (existingLead) {
          importErrors.push(`Lead ${i + 1}: Email already exists`);
          continue;
        }

        const newLead = new Lead({
          companyId,
          name: leadData.name,
          email: leadData.email,
          createdBy: defaultUser._id,
          assignedTo: defaultUser._id,
          phone: leadData.phone,
          propertyType: leadData.propertyType || 'apartment',
          status: 'new',
          source: leadData.source || 'bulk_import',
          location: leadData.location,
          notes: leadData.notes,
          createdAt: new Date()
        });

        await newLead.save();
        processedLeads.push(newLead._id);

        // Send notification email for each lead
        try {
          const populatedLead = await Lead.findById(newLead._id)
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email');

          await notificationService.createLeadNotification(populatedLead, 'webhook');
          console.log(`✅ Bulk import lead notification sent for lead ${i + 1}`);
        } catch (notificationError) {
          console.error(`Failed to send bulk import lead notification for lead ${i + 1}:`, notificationError);
          // Don't fail the lead creation if notification fails
        }
      } catch (error) {
        importErrors.push(`Lead ${i + 1}: ${error.message}`);
      }
    }

    res.status(201).json({
      success: true,
      message: `Processed ${processedLeads.length} leads successfully`,
      processedCount: processedLeads.length,
      totalCount: leads.length,
      errors: importErrors.length > 0 ? importErrors : undefined
    });
  } catch (error) {
    console.error('Bulk lead import error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/webhooks/sources
// @desc    Get available lead sources for a company
// @access  Private
router.get('/sources', authMiddleware, async (req, res) => {
  try {
    const sources = [
      { value: 'website', label: 'Website Form' },
      { value: 'google_ads', label: 'Google Ads' },
      { value: 'meta_ads', label: 'Meta/Facebook Ads' },
      { value: 'seo', label: 'SEO/Organic' },
      { value: 'referral', label: 'Referral' },
      { value: 'walk_in', label: 'Walk-in' },
      { value: 'phone_call', label: 'Phone Call' },
      { value: 'email', label: 'Email' },
      { value: 'social_media', label: 'Social Media' },
      { value: 'open_house', label: 'Open House' },
      { value: 'bulk_import', label: 'Bulk Import' },
      { value: 'other', label: 'Other' }
    ];

    res.json(sources);
  } catch (error) {
    console.error('Get sources error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/webhooks/leads/dynamic
// @desc    Create lead from dynamic form template
// @access  Public (with API key validation)
router.post('/leads/dynamic', [
  body('templateId').notEmpty().withMessage('Template ID is required'),
  body('companyId').notEmpty().withMessage('Company ID is required'),
  body('apiKey').notEmpty().withMessage('API key is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { templateId, companyId, apiKey, ...formData } = req.body;

    // Validate API key
    if (apiKey !== process.env.WEBHOOK_API_KEY) {
      return res.status(401).json({ message: 'Invalid API key' });
    }

    // Get form template
    const FormTemplate = require('../models/FormTemplate');
    const template = await FormTemplate.findOne({
      _id: templateId,
      companyId: companyId
    });

    if (!template) {
      return res.status(404).json({ message: 'Form template not found' });
    }

    // Check if company exists and is active
    const Company = require('../models/Company');
    const company = await Company.findById(companyId);
    if (!company || !company.isActive) {
      return res.status(404).json({ message: 'Company not found or inactive' });
    }

    // Check subscription limits
    const subscription = await Subscription.findOne({ companyId });
    const leadCount = await Lead.countDocuments({ companyId });

    if (subscription && subscription.features.maxLeads !== -1 && leadCount >= subscription.features.maxLeads) {
      return res.status(403).json({
        message: 'Lead limit reached. Please upgrade your plan to add more leads.'
      });
    }

    // Find a default user for form-created leads
    const defaultUser = await User.findOne({ companyId }).select('_id');
    if (!defaultUser) {
      return res.status(400).json({ message: 'No users found in company' });
    }

    // Map form data to lead fields
    const leadData = {
      companyId,
      source: 'dynamic_form',
      createdBy: defaultUser._id,
      assignedTo: defaultUser._id,
      customFields: {}
    };

    // Map standard fields
    template.fields.forEach(field => {
      const value = formData[field.name];

      if (value) {
        switch (field.mapping) {
          case 'name':
            leadData.name = value;
            break;
          case 'email':
            leadData.email = value;
            break;
          case 'phone':
            leadData.phone = value;
            break;
          case 'propertyType':
            leadData.propertyType = value;
            break;
          case 'location':
            leadData.location = value;
            break;
          case 'notes':
            leadData.notes = value;
            break;
          case 'custom':
          default:
            leadData.customFields[field.name] = {
              label: field.label,
              value: value,
              type: field.type
            };
        }
      }
    });

    // Ensure required fields are present
    if (!leadData.name || !leadData.email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    // Create lead
    const lead = new Lead(leadData);
    await lead.save();

    // Send notification email
    try {
      const populatedLead = await Lead.findById(lead._id)
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email');

      await notificationService.createLeadNotification(populatedLead, 'webhook');
      console.log('✅ Dynamic form lead notification sent successfully');
    } catch (notificationError) {
      console.error('Failed to send dynamic form lead notification:', notificationError);
      // Don't fail the lead creation if notification fails
    }

    // Update template usage
    await FormTemplate.findByIdAndUpdate(templateId, {
      $inc: { 'usage.totalSubmissions': 1 },
      $set: { 'usage.lastUsed': new Date() }
    });

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      leadId: lead._id
    });
  } catch (error) {
    console.error('Dynamic form lead creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
