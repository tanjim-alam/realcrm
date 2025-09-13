const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const EmailTemplate = require('../models/EmailTemplate');
const { authMiddleware } = require('../middleware/auth');

// @route   GET /api/email-templates
// @desc    Get all email templates for company
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { companyId } = req.user;
    const { type, isActive } = req.query;

    const query = { companyId };
    if (type) query.type = type;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const templates = await EmailTemplate.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(templates);
  } catch (error) {
    console.error('Get email templates error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/email-templates/:id
// @desc    Get single email template
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const template = await EmailTemplate.findOne({
      _id: req.params.id,
      companyId: req.user.companyId
    }).populate('createdBy', 'name email');

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    res.json(template);
  } catch (error) {
    console.error('Get email template error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/email-templates
// @desc    Create new email template
// @access  Private
router.post('/', [
  body('name').notEmpty().withMessage('Template name is required'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('content').notEmpty().withMessage('Content is required'),
  body('type').isIn(['welcome', 'follow_up', 'appointment', 'property_showcase', 'closing', 'custom'])
    .withMessage('Invalid template type')
], authMiddleware, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const template = new EmailTemplate({
      ...req.body,
      companyId: req.user.companyId,
      createdBy: req.user._id
    });

    await template.save();
    await template.populate('createdBy', 'name email');

    res.status(201).json(template);
  } catch (error) {
    console.error('Create email template error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/email-templates/:id
// @desc    Update email template
// @access  Private
router.put('/:id', [
  body('name').optional().notEmpty().withMessage('Template name cannot be empty'),
  body('subject').optional().notEmpty().withMessage('Subject cannot be empty'),
  body('content').optional().notEmpty().withMessage('Content cannot be empty'),
  body('type').optional().isIn(['welcome', 'follow_up', 'appointment', 'property_showcase', 'closing', 'custom'])
    .withMessage('Invalid template type')
], authMiddleware, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const template = await EmailTemplate.findOneAndUpdate(
      { _id: req.params.id, companyId: req.user.companyId },
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    res.json(template);
  } catch (error) {
    console.error('Update email template error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/email-templates/:id
// @desc    Delete email template
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const template = await EmailTemplate.findOneAndDelete({
      _id: req.params.id,
      companyId: req.user.companyId
    });

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Delete email template error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/email-templates/:id/duplicate
// @desc    Duplicate email template
// @access  Private
router.post('/:id/duplicate', authMiddleware, async (req, res) => {
  try {
    const originalTemplate = await EmailTemplate.findOne({
      _id: req.params.id,
      companyId: req.user.companyId
    });

    if (!originalTemplate) {
      return res.status(404).json({ message: 'Template not found' });
    }

    const duplicatedTemplate = new EmailTemplate({
      ...originalTemplate.toObject(),
      _id: undefined,
      name: `${originalTemplate.name} (Copy)`,
      createdBy: req.user._id,
      usage: {
        sent: 0,
        opened: 0,
        clicked: 0,
        replied: 0
      }
    });

    await duplicatedTemplate.save();
    await duplicatedTemplate.populate('createdBy', 'name email');

    res.status(201).json(duplicatedTemplate);
  } catch (error) {
    console.error('Duplicate email template error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/email-templates/types/defaults
// @desc    Get default email templates
// @access  Private
router.get('/types/defaults', authMiddleware, async (req, res) => {
  try {
    const defaultTemplates = {
      welcome: {
        name: 'Welcome Email',
        subject: 'Welcome to {{companyName}} - Your Real Estate Journey Starts Here!',
        content: `
          <h2>Welcome {{leadName}}!</h2>
          <p>Thank you for your interest in {{companyName}}. We're excited to help you find your perfect property.</p>
          <p>Our team of experienced real estate professionals is here to guide you through every step of the process.</p>
          <p>What's next?</p>
          <ul>
            <li>Schedule a consultation with one of our agents</li>
            <li>Browse our current property listings</li>
            <li>Get personalized recommendations based on your preferences</li>
          </ul>
          <p>Best regards,<br>{{agentName}}<br>{{companyName}}</p>
        `,
        type: 'welcome',
        variables: [
          { name: 'leadName', description: 'Lead\'s name', defaultValue: 'there' },
          { name: 'companyName', description: 'Company name', defaultValue: 'Our Company' },
          { name: 'agentName', description: 'Agent\'s name', defaultValue: 'Your Agent' }
        ]
      },
      follow_up: {
        name: 'Follow-up Email',
        subject: 'Following up on your property search - {{companyName}}',
        content: `
          <h2>Hi {{leadName}},</h2>
          <p>I wanted to follow up on your property search. Have you had a chance to review the properties I shared with you?</p>
          <p>I'm here to answer any questions you might have and help you find the perfect home.</p>
          <p>Would you like to:</p>
          <ul>
            <li>Schedule a property viewing?</li>
            <li>Discuss your budget and financing options?</li>
            <li>Explore different neighborhoods?</li>
          </ul>
          <p>Please let me know what works best for your schedule.</p>
          <p>Best regards,<br>{{agentName}}<br>{{companyName}}</p>
        `,
        type: 'follow_up',
        variables: [
          { name: 'leadName', description: 'Lead\'s name', defaultValue: 'there' },
          { name: 'companyName', description: 'Company name', defaultValue: 'Our Company' },
          { name: 'agentName', description: 'Agent\'s name', defaultValue: 'Your Agent' }
        ]
      },
      appointment: {
        name: 'Appointment Confirmation',
        subject: 'Appointment Confirmed - {{appointmentDate}} at {{appointmentTime}}',
        content: `
          <h2>Appointment Confirmed</h2>
          <p>Hi {{leadName}},</p>
          <p>Your appointment has been confirmed for:</p>
          <p><strong>Date:</strong> {{appointmentDate}}<br>
          <strong>Time:</strong> {{appointmentTime}}<br>
          <strong>Location:</strong> {{appointmentLocation}}</p>
          <p>Please arrive 10 minutes early. If you need to reschedule, please contact me at least 24 hours in advance.</p>
          <p>Looking forward to meeting with you!</p>
          <p>Best regards,<br>{{agentName}}<br>{{companyName}}<br>{{agentPhone}}</p>
        `,
        type: 'appointment',
        variables: [
          { name: 'leadName', description: 'Lead\'s name', defaultValue: 'there' },
          { name: 'appointmentDate', description: 'Appointment date', defaultValue: 'TBD' },
          { name: 'appointmentTime', description: 'Appointment time', defaultValue: 'TBD' },
          { name: 'appointmentLocation', description: 'Appointment location', defaultValue: 'Office' },
          { name: 'agentName', description: 'Agent\'s name', defaultValue: 'Your Agent' },
          { name: 'companyName', description: 'Company name', defaultValue: 'Our Company' },
          { name: 'agentPhone', description: 'Agent\'s phone', defaultValue: 'Contact us' }
        ]
      }
    };

    res.json(defaultTemplates);
  } catch (error) {
    console.error('Get default templates error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
