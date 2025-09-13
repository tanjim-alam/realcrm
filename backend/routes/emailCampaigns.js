const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const EmailCampaign = require('../models/EmailCampaign');
const EmailTemplate = require('../models/EmailTemplate');
const Lead = require('../models/Lead');
const EmailLog = require('../models/EmailLog');
const Company = require('../models/Company');
const { authMiddleware } = require('../middleware/auth');
const { sendEmail, sendBulkEmails } = require('../config/email');

// @route   GET /api/email-campaigns
// @desc    Get all email campaigns for company
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { companyId } = req.user;
    const campaigns = await EmailCampaign.find({ companyId })
      .populate('templateId', 'name subject type')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(campaigns);
  } catch (error) {
    console.error('Get email campaigns error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/email-campaigns
// @desc    Create new email campaign
// @access  Private
router.post('/', [
  body('name').notEmpty().withMessage('Campaign name is required'),
  body('templateId').isMongoId().withMessage('Valid template ID is required')
], authMiddleware, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const template = await EmailTemplate.findOne({
      _id: req.body.templateId,
      companyId: req.user.companyId
    });

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    const campaign = new EmailCampaign({
      ...req.body,
      companyId: req.user.companyId,
      createdBy: req.user._id
    });

    await campaign.save();
    res.status(201).json(campaign);
  } catch (error) {
    console.error('Create email campaign error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/email-campaigns/:id/send
// @desc    Send email campaign
// @access  Private
router.post('/:id/send', authMiddleware, async (req, res) => {
  try {
    const campaign = await EmailCampaign.findOne({
      _id: req.params.id,
      companyId: req.user.companyId
    }).populate('templateId');

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Get selected leads from request body, or all leads if none specified
    let leads;
    if (req.body.selectedLeadIds && req.body.selectedLeadIds.length > 0) {
      leads = await Lead.find({ 
        _id: { $in: req.body.selectedLeadIds },
        companyId: req.user.companyId 
      });
    } else {
      leads = await Lead.find({ companyId: req.user.companyId });
    }

    if (leads.length === 0) {
      return res.status(400).json({ message: 'No leads found' });
    }

    // Get company data for email personalization
    const company = await Company.findById(req.user.companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Update campaign status
    campaign.status = 'sending';
    await campaign.save();

    // Send emails
    let sentCount = 0;
    let failedCount = 0;

    for (const lead of leads) {
      try {
        // Replace template variables
        let subject = campaign.templateId.subject;
        let content = campaign.templateId.content;

        // Replace common variables with actual company data
        subject = subject.replace(/\{\{leadName\}\}/g, lead.name || 'there');
        subject = subject.replace(/\{\{companyName\}\}/g, company.name || 'Your Company');
        subject = subject.replace(/\{\{companyEmail\}\}/g, company.email || 'contact@yourcompany.com');
        subject = subject.replace(/\{\{companyPhone\}\}/g, company.phone || 'Contact us');
        
        content = content.replace(/\{\{leadName\}\}/g, lead.name || 'there');
        content = content.replace(/\{\{companyName\}\}/g, company.name || 'Your Company');
        content = content.replace(/\{\{companyEmail\}\}/g, company.email || 'contact@yourcompany.com');
        content = content.replace(/\{\{companyPhone\}\}/g, company.phone || 'Contact us');

        // Send email with company data
        console.log(`Sending email to ${lead.email} with subject: ${subject}`);
        console.log('Company data:', company);
        const result = await sendEmail(lead.email, subject, content, '', company);
        console.log('Email result:', result);

        // Create email log
        const emailLog = new EmailLog({
          companyId: req.user.companyId,
          leadId: lead._id,
          campaignId: campaign._id,
          templateId: campaign.templateId._id,
          type: 'campaign',
          subject,
          content,
          recipient: {
            email: lead.email,
            name: lead.name
          },
          status: result.success ? 'sent' : 'failed',
          sentBy: req.user._id,
          tracking: {
            messageId: result.messageId || `campaign_${campaign._id}_${lead._id}_${Date.now()}`,
            error: result.error || null
          }
        });

        await emailLog.save();

        if (result.success) {
          sentCount++;
        } else {
          failedCount++;
        }

        // Add delay between emails
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`Error sending email to ${lead.email}:`, error);
        failedCount++;
      }
    }

    // Update campaign stats
    campaign.status = 'sent';
    campaign.stats.sent = sentCount;
    await campaign.save();

    res.json({
      message: 'Campaign sent successfully',
      sent: sentCount,
      failed: failedCount,
      total: leads.length
    });

  } catch (error) {
    console.error('Send email campaign error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});