const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { authMiddleware: auth } = require('../middleware/auth');
const SMS = require('../models/SMS');
const SMSCampaign = require('../models/SMSCampaign');
const Lead = require('../models/Lead');
const router = express.Router();

// Initialize Twilio client (optional)
let twilioClient = null;
try {
  const twilio = require('twilio');
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }
} catch (error) {
  console.log('Twilio not available:', error.message);
}

// @route   GET /api/sms/leads
// @desc    Get leads with phone numbers for SMS
// @access  Private
router.get('/leads', auth, async (req, res) => {
  try {
    const leads = await Lead.find({
      companyId: req.user.companyId,
      phone: { $exists: true, $ne: null, $ne: '' }
    })
      .select('name email phone status')
      .sort({ name: 1 });

    res.json(leads);
  } catch (error) {
    console.error('Get leads for SMS error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/sms
// @desc    Get all SMS messages for company
// @access  Private
router.get('/', auth, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['pending', 'sent', 'delivered', 'failed', 'undelivered']),
  query('campaignId').optional().isMongoId(),
  query('leadId').optional().isMongoId()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { companyId: req.user.companyId };
    
    if (req.query.status) filter.status = req.query.status;
    if (req.query.campaignId) filter.campaignId = req.query.campaignId;
    if (req.query.leadId) filter.leadId = req.query.leadId;

    const smsMessages = await SMS.find(filter)
      .populate('leadId', 'name email phone')
      .populate('campaignId', 'name')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await SMS.countDocuments(filter);

    res.json({
      smsMessages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get SMS messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/sms/send
// @desc    Send a single SMS message
// @access  Private
router.post('/send', auth, [
  body('leadId').isMongoId().withMessage('Valid lead ID is required'),
  body('message').notEmpty().withMessage('Message is required'),
  body('message').isLength({ max: 1600 }).withMessage('Message too long'),
  body('priority').optional().isIn(['low', 'normal', 'high']),
  body('scheduledAt').optional().custom((value) => {
    if (value && value !== '') {
      return new Date(value).toString() !== 'Invalid Date';
    }
    return true;
  }).withMessage('Invalid date format for scheduledAt')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { leadId, message, priority = 'normal', scheduledAt } = req.body;

    // Get lead information
    const lead = await Lead.findOne({
      _id: leadId,
      companyId: req.user.companyId
    });

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    if (!lead.phone) {
      return res.status(400).json({ message: 'Lead has no phone number' });
    }

    // Create SMS record
    const sms = new SMS({
      companyId: req.user.companyId,
      leadId: lead._id,
      to: lead.phone,
      from: process.env.TWILIO_PHONE_NUMBER || 'Demo Mode',
      message,
      priority,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
      metadata: {
        leadName: lead.name,
        leadEmail: lead.email,
        leadPhone: lead.phone
      },
      createdBy: req.user.id
    });

    await sms.save();

    // Send SMS immediately if not scheduled
    if (!scheduledAt || new Date(scheduledAt) <= new Date()) {
      if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
        try {
          const twilioMessage = await twilioClient.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: lead.phone,
            statusCallback: `${process.env.API_BASE_URL}/api/sms/webhook/status`
          });

          // Update SMS record with provider info
          sms.providerId = twilioMessage.sid;
          sms.status = 'sent';
          sms.sentAt = new Date();
          sms.cost = parseFloat(twilioMessage.price) || 0.0075;
          await sms.save();

          res.json({
            message: 'SMS sent successfully',
            sms: sms,
            providerId: twilioMessage.sid
          });
        } catch (twilioError) {
          sms.status = 'failed';
          sms.error = {
            code: twilioError.code,
            message: twilioError.message,
            details: twilioError.moreInfo
          };
          await sms.save();

          res.status(400).json({
            message: 'Failed to send SMS',
            error: twilioError.message
          });
        }
      } else {
        // Demo mode - simulate SMS sending
        sms.status = 'sent';
        sms.sentAt = new Date();
        sms.cost = 0.0075; // Demo cost
        sms.providerId = 'demo-' + Date.now();
        await sms.save();

        res.json({
          message: 'SMS sent successfully (Demo Mode - Twilio not configured)',
          sms: sms,
          demo: true
        });
      }
    } else {
      res.json({
        message: 'SMS scheduled successfully',
        sms: sms
      });
    }
  } catch (error) {
    console.error('Send SMS error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/sms/:id
// @desc    Get single SMS message
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const sms = await SMS.findOne({
      _id: req.params.id,
      companyId: req.user.companyId
    })
      .populate('leadId', 'name email phone')
      .populate('campaignId', 'name')
      .populate('createdBy', 'name email');

    if (!sms) {
      return res.status(404).json({ message: 'SMS not found' });
    }

    res.json(sms);
  } catch (error) {
    console.error('Get SMS error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/sms/:id
// @desc    Delete SMS message
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const sms = await SMS.findOne({
      _id: req.params.id,
      companyId: req.user.companyId
    });

    if (!sms) {
      return res.status(404).json({ message: 'SMS not found' });
    }

    if (sms.status === 'sent' || sms.status === 'delivered') {
      return res.status(400).json({ message: 'Cannot delete sent SMS' });
    }

    await SMS.findByIdAndDelete(req.params.id);

    res.json({ message: 'SMS deleted successfully' });
  } catch (error) {
    console.error('Delete SMS error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/sms/stats/overview
// @desc    Get SMS statistics overview
// @access  Private
router.get('/stats/overview', auth, [
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const startDate = req.query.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = req.query.endDate || new Date();

    const [companyStats, statusStats, topCampaigns] = await Promise.all([
      SMS.getCompanyStats(req.user.companyId, startDate, endDate),
      SMS.getStatusStats(req.user.companyId, startDate, endDate),
      SMS.getTopCampaigns(req.user.companyId, 5)
    ]);

    res.json({
      companyStats: companyStats[0] || {
        totalSent: 0,
        totalDelivered: 0,
        totalFailed: 0,
        totalCost: 0,
        avgDeliveryTime: 0
      },
      statusStats,
      topCampaigns
    });
  } catch (error) {
    console.error('Get SMS stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/sms/webhook/status
// @desc    Twilio status webhook
// @access  Public (Twilio webhook)
router.post('/webhook/status', async (req, res) => {
  try {
    const { MessageSid, MessageStatus, ErrorCode, ErrorMessage } = req.body;

    const sms = await SMS.findOne({ providerId: MessageSid });
    if (!sms) {
      return res.status(404).json({ message: 'SMS not found' });
    }

    // Update SMS status
    sms.status = MessageStatus;
    if (MessageStatus === 'delivered') {
      sms.deliveredAt = new Date();
    } else if (MessageStatus === 'failed' || MessageStatus === 'undelivered') {
      sms.error = {
        code: ErrorCode,
        message: ErrorMessage
      };
    }

    await sms.save();

    res.json({ message: 'Status updated' });
  } catch (error) {
    console.error('SMS webhook error:', error);
    res.status(500).json({ message: 'Webhook error' });
  }
});

// @route   POST /api/sms/webhook/reply
// @desc    Twilio reply webhook
// @access  Public (Twilio webhook)
router.post('/webhook/reply', async (req, res) => {
  try {
    const { MessageSid, From, Body, DateSent } = req.body;

    // Find the original SMS by phone number
    const originalSms = await SMS.findOne({
      to: From,
      companyId: { $exists: true }
    }).sort({ createdAt: -1 });

    if (originalSms) {
      // Create reply SMS record
      const replySms = new SMS({
        companyId: originalSms.companyId,
        leadId: originalSms.leadId,
        campaignId: originalSms.campaignId,
        to: process.env.TWILIO_PHONE_NUMBER,
        from: From,
        message: Body,
        type: 'response',
        status: 'delivered',
        sentAt: new Date(DateSent),
        deliveredAt: new Date(DateSent),
        providerId: MessageSid,
        response: {
          messageId: MessageSid,
          body: Body,
          receivedAt: new Date(DateSent),
          from: From
        },
        createdBy: originalSms.createdBy
      });

      await replySms.save();

      // Update tracking stats
      originalSms.tracking.replies += 1;
      await originalSms.save();

      // Update campaign stats if applicable
      if (originalSms.campaignId) {
        await SMSCampaign.findByIdAndUpdate(originalSms.campaignId, {
          $inc: { 'stats.totalReplies': 1 }
        });
      }
    }

    res.json({ message: 'Reply processed' });
  } catch (error) {
    console.error('SMS reply webhook error:', error);
    res.status(500).json({ message: 'Webhook error' });
  }
});

module.exports = router;


