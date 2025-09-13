const express = require('express');
const { body, validationResult } = require('express-validator');
const Lead = require('../models/Lead');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Company = require('../models/Company');
const { authMiddleware } = require('../middleware/auth');
const notificationService = require('../services/notificationService');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// @route   GET /api/leads
// @desc    Get all leads for the company
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { status, assignedTo, page = 1, limit = 10 } = req.query;
    
    // Build filter object
    const filter = { companyId: req.user.companyId };
    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = assignedTo;

    const leads = await Lead.find(filter)
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Lead.countDocuments(filter);

    res.json({
      leads,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/leads/:id
// @desc    Get single lead
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const lead = await Lead.findOne({
      _id: req.params.id,
      companyId: req.user.companyId
    }).populate('assignedTo', 'name email');

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    res.json(lead);
  } catch (error) {
    console.error('Get lead error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/leads
// @desc    Create new lead
// @access  Private
router.post('/', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('phone').optional().isString().withMessage('Phone must be a string'),
  body('budget').optional().isNumeric().withMessage('Budget must be a number'),
  body('propertyType').optional().isIn(['apartment', 'house', 'condo', 'townhouse', 'commercial', 'land', 'other']),
  body('status').optional().isIn(['new', 'contacted', 'visit', 'offer', 'closed', 'lost'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check subscription limits
    const subscription = await Subscription.findOne({ companyId: req.user.companyId });
    const leadCount = await Lead.countDocuments({ companyId: req.user.companyId });
    
    if (subscription && subscription.features.maxLeads !== -1 && leadCount >= subscription.features.maxLeads) {
      return res.status(403).json({ 
        message: 'Lead limit reached. Please upgrade your plan to add more leads.' 
      });
    }

    const leadData = {
      ...req.body,
      companyId: req.user.companyId
    };

    const lead = new Lead(leadData);
    await lead.save();

    const populatedLead = await Lead.findById(lead._id)
      .populate('assignedTo', 'name email');

    // Send notification email
    try {
      const company = await Company.findById(req.user.companyId);
      if (company) {
        await notificationService.sendNewLeadNotification(populatedLead, company);
      }
    } catch (notificationError) {
      console.error('Failed to send lead notification:', notificationError);
      // Don't fail the lead creation if notification fails
    }

    res.status(201).json(populatedLead);
  } catch (error) {
    console.error('Create lead error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/leads/:id
// @desc    Update lead
// @access  Private
router.put('/:id', [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Please provide a valid email'),
  body('phone').optional().isString().withMessage('Phone must be a string'),
  body('budget').optional().isNumeric().withMessage('Budget must be a number'),
  body('propertyType').optional().isIn(['apartment', 'house', 'condo', 'townhouse', 'commercial', 'land', 'other']),
  body('status').optional().isIn(['new', 'contacted', 'visit', 'offer', 'closed', 'lost'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Get the old lead data for comparison
    const oldLead = await Lead.findOne({ _id: req.params.id, companyId: req.user.companyId });
    
    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, companyId: req.user.companyId },
      req.body,
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email');

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Send notification for status change
    if (oldLead && oldLead.status !== lead.status) {
      try {
        const company = await Company.findById(req.user.companyId);
        if (company) {
          await notificationService.sendLeadStatusChangeNotification(lead, oldLead.status, lead.status, company);
        }
      } catch (notificationError) {
        console.error('Failed to send status change notification:', notificationError);
        // Don't fail the update if notification fails
      }
    }

    res.json(lead);
  } catch (error) {
    console.error('Update lead error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/leads/:id
// @desc    Delete lead
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const lead = await Lead.findOneAndDelete({
      _id: req.params.id,
      companyId: req.user.companyId
    });

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    console.error('Delete lead error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/leads/:id/assign
// @desc    Assign lead to agent (Admin and Agent can assign)
// @access  Private
router.put('/:id/assign', [
  body('assignedTo').optional().isMongoId().withMessage('Valid agent ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { assignedTo } = req.body;

    // If assignedTo is provided, verify the agent belongs to the same company and check capacity
    if (assignedTo) {
      const agent = await User.findOne({
        _id: assignedTo,
        companyId: req.user.companyId,
        role: { $in: ['admin', 'agent'] }
      });

      if (!agent) {
        return res.status(404).json({ message: 'Agent not found or not authorized' });
      }

      // Check if agent has reached their lead capacity
      const currentLeadCount = await Lead.countDocuments({
        companyId: req.user.companyId,
        assignedTo: assignedTo,
        status: { $nin: ['closed', 'lost'] } // Don't count closed/lost leads
      });

      if (currentLeadCount >= agent.leadCapacity) {
        return res.status(400).json({ 
          message: `Agent ${agent.name} has reached their lead capacity (${agent.leadCapacity} leads). Please assign to another agent or increase their capacity.`,
          agentCapacity: agent.leadCapacity,
          currentLeads: currentLeadCount
        });
      }
    }

    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, companyId: req.user.companyId },
      { assignedTo: assignedTo || null },
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email');

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Send notification for assignment
    if (assignedTo && lead.assignedTo) {
      try {
        const company = await Company.findById(req.user.companyId);
        if (company) {
          await notificationService.sendLeadAssignmentNotification(lead, lead.assignedTo, company);
        }
      } catch (notificationError) {
        console.error('Failed to send assignment notification:', notificationError);
        // Don't fail the assignment if notification fails
      }
    }

    res.json(lead);
  } catch (error) {
    console.error('Assign lead error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/leads/:id/reminder
// @desc    Set reminder for lead
// @access  Private
router.put('/:id/reminder', [
  body('reminder.date').isISO8601().withMessage('Valid reminder date is required'),
  body('reminder.message').optional().isString().withMessage('Reminder message must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { reminder } = req.body;

    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, companyId: req.user.companyId },
      { 
        reminder: {
          date: new Date(reminder.date),
          message: reminder.message || '',
          isCompleted: false
        }
      },
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email');

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Send reminder confirmation notification
    try {
      const company = await Company.findById(req.user.companyId);
      if (company) {
        await notificationService.sendReminderConfirmationNotification(lead, company);
        console.log('✅ Reminder confirmation notification sent');
      }
    } catch (notificationError) {
      console.error('Failed to send reminder confirmation notification:', notificationError);
    }

    res.json(lead);
  } catch (error) {
    console.error('Set reminder error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/leads/:id/reminder/complete
// @desc    Mark reminder as completed
// @access  Private
router.put('/:id/reminder/complete', async (req, res) => {
  try {
    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, companyId: req.user.companyId },
      { 'reminder.isCompleted': true },
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email');

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    res.json(lead);
  } catch (error) {
    console.error('Complete reminder error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/leads/:id/reminder
// @desc    Remove reminder from lead
// @access  Private
router.delete('/:id/reminder', async (req, res) => {
  try {
    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, companyId: req.user.companyId },
      { 
        $unset: { 
          reminder: 1 
        } 
      },
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email');

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    res.json({ message: 'Reminder removed successfully', lead });
  } catch (error) {
    console.error('Remove reminder error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/leads/reminders/upcoming
// @desc    Get upcoming reminders
// @access  Private
router.get('/reminders/upcoming', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + parseInt(days));

    const leads = await Lead.find({
      companyId: req.user.companyId,
      'reminder.date': { $lte: futureDate, $gte: new Date() },
      'reminder.isCompleted': false
    })
    .populate('assignedTo', 'name email')
    .sort({ 'reminder.date': 1 });

    res.json(leads);
  } catch (error) {
    console.error('Get upcoming reminders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/leads/reminders/check
// @desc    Manually check for due reminders (for testing)
// @access  Private
router.post('/reminders/check', async (req, res) => {
  try {
    const reminderService = require('../services/reminderService');
    await reminderService.checkRemindersNow();
    res.json({ message: 'Reminder check completed' });
  } catch (error) {
    console.error('Manual reminder check error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/leads/agents/capacity
// @desc    Get agent capacity information
// @access  Private
router.get('/agents/capacity', async (req, res) => {
  try {
    const agents = await User.find({
      companyId: req.user.companyId,
      role: { $in: ['admin', 'agent'] },
      isActive: true
    }).select('name email role leadCapacity specializations availability');

    const agentCapacityInfo = await Promise.all(
      agents.map(async (agent) => {
        const currentLeads = await Lead.countDocuments({
          companyId: req.user.companyId,
          assignedTo: agent._id,
          status: { $nin: ['closed', 'lost'] }
        });

        return {
          _id: agent._id,
          name: agent.name,
          email: agent.email,
          role: agent.role,
          leadCapacity: agent.leadCapacity,
          currentLeads,
          availableCapacity: agent.leadCapacity - currentLeads,
          isAtCapacity: currentLeads >= agent.leadCapacity,
          specializations: agent.specializations,
          availability: agent.availability
        };
      })
    );

    res.json(agentCapacityInfo);
  } catch (error) {
    console.error('Get agent capacity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/leads/:id/auto-assign
// @desc    Auto-assign lead to best matching agent (Admin and Agent can use)
// @access  Private
router.post('/:id/auto-assign', async (req, res) => {
  try {
    const lead = await Lead.findOne({
      _id: req.params.id,
      companyId: req.user.companyId
    });

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    console.log('Auto-assigning lead:', {
      leadId: lead._id,
      leadName: lead.name,
      leadData: {
        propertyType: lead.propertyType,
        budget: lead.budget,
        priority: lead.priority,
        timeline: lead.timeline,
        location: lead.location
      }
    });

    // Get all available agents (relax the availability filter for now)
    const agents = await User.find({
      companyId: req.user.companyId,
      role: { $in: ['admin', 'agent'] },
      isActive: true
    }).select('name email role leadCapacity specializations availability');

    console.log('Found agents:', agents.length);

    if (agents.length === 0) {
      return res.status(400).json({ message: 'No available agents found' });
    }

    // Calculate match scores for each agent
    const agentScores = await Promise.all(
      agents.map(async (agent) => {
        let score = 0;
        let reasons = [];

        // Check capacity
        const currentLeads = await Lead.countDocuments({
          companyId: req.user.companyId,
          assignedTo: agent._id,
          status: { $nin: ['closed', 'lost'] }
        });

        if (currentLeads >= agent.leadCapacity) {
          return { agent, score: 0, reasons: ['At capacity'] };
        }

        // Capacity score (more available capacity = higher score)
        const capacityScore = (agent.leadCapacity - currentLeads) / agent.leadCapacity * 20;
        score += capacityScore;
        reasons.push(`Capacity: ${agent.leadCapacity - currentLeads}/${agent.leadCapacity}`);

        // Property type match
        if (agent.specializations && agent.specializations.propertyTypes && agent.specializations.propertyTypes.length > 0) {
          if (lead.propertyType && agent.specializations.propertyTypes.includes(lead.propertyType)) {
            score += 30;
            reasons.push('Property type match');
          } else if (agent.specializations.propertyTypes.includes('luxury') && lead.budget && lead.budget > 5000000) {
            score += 25;
            reasons.push('Luxury property match');
          } else if (agent.specializations.propertyTypes.includes('first_time_buyer') && lead.budget && lead.budget < 2000000) {
            score += 25;
            reasons.push('First-time buyer match');
          }
        }

        // Geographic match
        if (agent.specializations && agent.specializations.areas && agent.specializations.areas.length > 0) {
          if (lead.location && lead.location.area) {
            if (agent.specializations.areas.includes(lead.location.area)) {
              score += 25;
              reasons.push('Area match');
            }
          }
        }

        // Budget range match
        if (lead.budget && agent.specializations && agent.specializations.budgetRange) {
          if (lead.budget >= agent.specializations.budgetRange.min && 
              lead.budget <= agent.specializations.budgetRange.max) {
            score += 20;
            reasons.push('Budget range match');
          }
        }

        // Experience level match with priority
        if (lead.priority && agent.specializations && agent.specializations.experience) {
          if (lead.priority === 'hot' && agent.specializations.experience === 'expert') {
            score += 15;
            reasons.push('Expert for hot lead');
          } else if (lead.priority === 'warm' && ['senior', 'expert'].includes(agent.specializations.experience)) {
            score += 10;
            reasons.push('Experienced for warm lead');
          } else if (lead.priority === 'cold' && agent.specializations.experience === 'junior') {
            score += 5;
            reasons.push('Junior for cold lead');
          }
        }

        // Response time match
        if (lead.timeline && agent.availability && agent.availability.responseTime) {
          if (lead.timeline === 'immediate' && agent.availability.responseTime === 'immediate') {
            score += 15;
            reasons.push('Immediate response');
          } else if (lead.timeline === '1-3_months' && ['immediate', 'within_hour'].includes(agent.availability.responseTime)) {
            score += 10;
            reasons.push('Quick response');
          }
        }

        // Fallback scoring for leads without new fields
        if (!lead.priority && !lead.timeline && !lead.location) {
          // Give basic score based on capacity and availability
          if (agent.availability && agent.availability.isAvailable) {
            score += 10;
            reasons.push('Available agent');
          }
        }

        return { agent, score, reasons };
      })
    );

    // Sort by score and get the best match
    const sortedAgents = agentScores
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);

    console.log('Agent scores:', agentScores.map(item => ({
      name: item.agent.name,
      score: item.score,
      reasons: item.reasons
    })));

    if (sortedAgents.length === 0) {
      return res.status(400).json({ message: 'No suitable agents found for this lead' });
    }

    const bestMatch = sortedAgents[0];

    // Assign the lead
    const updatedLead = await Lead.findOneAndUpdate(
      { _id: req.params.id, companyId: req.user.companyId },
      { assignedTo: bestMatch.agent._id },
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email');

    res.json({
      message: 'Lead auto-assigned successfully',
      lead: updatedLead,
      assignedAgent: {
        name: bestMatch.agent.name,
        score: bestMatch.score,
        reasons: bestMatch.reasons
      },
      alternatives: sortedAgents.slice(1, 4).map(item => ({
        name: item.agent.name,
        score: item.score,
        reasons: item.reasons
      }))
    });

  } catch (error) {
    console.error('Auto-assign lead error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/leads/stats/summary
// @desc    Get leads statistics
// @access  Private
router.get('/stats/summary', async (req, res) => {
  try {
    const stats = await Lead.aggregate([
      { $match: { companyId: req.user.companyId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalLeads = await Lead.countDocuments({ companyId: req.user.companyId });
    const recentLeads = await Lead.find({ companyId: req.user.companyId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('assignedTo', 'name');

    res.json({
      statusCounts: stats,
      totalLeads,
      recentLeads
    });
  } catch (error) {
    console.error('Get leads stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/leads/stats/platforms
// @desc    Get leads statistics by platform/source
// @access  Private
router.get('/stats/platforms', async (req, res) => {
  try {
    const platformStats = await Lead.aggregate([
      { $match: { companyId: req.user.companyId } },
      {
        $group: {
          _id: { $ifNull: ['$source', 'Not specified'] },
          count: { $sum: 1 },
          totalValue: { $sum: { $ifNull: ['$budget', 0] } }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Format platform names for display
    const formattedStats = platformStats.map(stat => ({
      platform: stat._id,
      count: stat.count,
      totalValue: stat.totalValue,
      displayName: formatPlatformName(stat._id)
    }));

    res.json(formattedStats);
  } catch (error) {
    console.error('Get platform stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to format platform names
const formatPlatformName = (platform) => {
  const platformMap = {
    'google': 'Google',
    'facebook': 'Facebook',
    'instagram': 'Instagram',
    'linkedin': 'LinkedIn',
    'youtube': 'YouTube',
    'twitter': 'Twitter',
    'tiktok': 'TikTok',
    'brochure_download': 'Brochure Download',
    'cost_sheet_download': 'Cost Sheet Download',
    'google_ads': 'Google Ads',
    'facebook_ads': 'Facebook Ads',
    'referral': 'Referral',
    'walk_in': 'Walk In',
    'other': 'Other',
    'Not specified': 'Not Specified'
  };
  
  return platformMap[platform] || platform.charAt(0).toUpperCase() + platform.slice(1);
};

module.exports = router;
