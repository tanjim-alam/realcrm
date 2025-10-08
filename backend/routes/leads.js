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

// @route   POST /api/leads/test-notification
// @desc    Test notification endpoint
// @access  Private
router.post('/test-notification', async (req, res) => {
  try {
    const { name, email, platform = 'website' } = req.body;

    // Create a test lead
    const testLead = {
      _id: new Date().getTime().toString(),
      name: name || 'Test Lead',
      email: email || 'test@example.com',
      companyId: req.user.companyId,
      assignedTo: req.user.id,
      createdBy: req.user.id,
      platform: platform,
      status: 'new',
      priority: 'warm'
    };

    // Send real-time notification
    try {
      await notificationService.createLeadNotification(testLead, platform);
      res.json({
        message: 'Test notification sent successfully',
        lead: testLead
      });
    } catch (notificationError) {
      console.error('Failed to send test notification:', notificationError);
      res.status(500).json({
        message: 'Lead created but notification failed',
        error: notificationError.message
      });
    }
  } catch (error) {
    console.error('Test notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/leads/test-assignment-notification
// @desc    Test lead assignment notification endpoint
// @access  Private
router.post('/test-assignment-notification', async (req, res) => {
  try {
    console.log('🧪 ===== TESTING LEAD ASSIGNMENT NOTIFICATION =====');

    // Create a test lead
    const testLead = {
      _id: new Date().getTime().toString(),
      name: 'Test Assignment Lead',
      email: 'test-assignment@example.com',
      phone: '+1234567890',
      companyId: req.user.companyId,
      status: 'new',
      priority: 'warm',
      source: 'test'
    };

    // Create a test assigned user (current user)
    const assignedTo = {
      _id: req.user.id,
      name: req.user.name,
      email: req.user.email
    };

    // Create a test assigned by user (current user as admin)
    const assignedBy = {
      _id: req.user.id,
      name: req.user.name,
      email: req.user.email
    };

    console.log('🧪 Test data:', {
      lead: testLead,
      assignedTo: assignedTo,
      assignedBy: assignedBy
    });

    // Send test assignment notification
    const result = await notificationService.createLeadAssignmentNotification(testLead, assignedTo, assignedBy);

    console.log('🧪 Test result:', result);
    console.log('🧪 ===== TEST COMPLETED =====');

    res.json({
      message: 'Test lead assignment notification sent successfully',
      result: result
    });
  } catch (error) {
    console.error('❌ Test assignment notification error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/leads
// @desc    Get all leads for the company (admin sees all, agents see only assigned)
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { status, assignedTo, propertyId, dateFilter, search, page = 1, limit = 100 } = req.query;

    // Build filter object
    const filter = { companyId: req.user.companyId };

    // If user is agent, only show their assigned leads
    if (req.user.role === 'agent') {
      filter.assignedTo = req.user.id;
    }

    if (status) filter.status = status;
    if (assignedTo && req.user.role === 'admin') filter.assignedTo = assignedTo;
    if (propertyId) filter.propertyId = propertyId;

    // Search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { source: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    // Date filtering
    if (dateFilter) {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

      switch (dateFilter) {
        case 'today':
          filter.createdAt = { $gte: startOfDay, $lt: endOfDay };
          break;
        case 'yesterday':
          const yesterdayStart = new Date(startOfDay);
          yesterdayStart.setDate(yesterdayStart.getDate() - 1);
          const yesterdayEnd = new Date(endOfDay);
          yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
          filter.createdAt = { $gte: yesterdayStart, $lt: yesterdayEnd };
          break;
        case 'this_week':
          const startOfWeek = new Date(startOfDay);
          startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
          filter.createdAt = { $gte: startOfWeek };
          break;
        case 'last_week':
          const lastWeekStart = new Date(startOfDay);
          lastWeekStart.setDate(startOfDay.getDate() - startOfDay.getDay() - 7);
          const lastWeekEnd = new Date(startOfDay);
          lastWeekEnd.setDate(startOfDay.getDate() - startOfDay.getDay());
          filter.createdAt = { $gte: lastWeekStart, $lt: lastWeekEnd };
          break;
        case 'this_month':
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          filter.createdAt = { $gte: startOfMonth };
          break;
        case 'last_month':
          const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);
          filter.createdAt = { $gte: lastMonthStart, $lt: lastMonthEnd };
          break;
        case 'this_year':
          const startOfYear = new Date(now.getFullYear(), 0, 1);
          filter.createdAt = { $gte: startOfYear };
          break;
      }
    }

    const leads = await Lead.find(filter)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('propertyId', 'title location price propertyType')
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

// @route   GET /api/leads/export
// @desc    Export leads to CSV
// @access  Private
router.get('/export', async (req, res) => {
  try {
    const { status, assignedTo, propertyId, dateFilter, search, format = 'csv' } = req.query;

    // Build filter object (same as GET /leads)
    const filter = { companyId: req.user.companyId };

    // If user is agent, only show their assigned leads
    if (req.user.role === 'agent') {
      filter.assignedTo = req.user.id;
    }

    if (status) filter.status = status;
    if (assignedTo && req.user.role === 'admin') filter.assignedTo = assignedTo;
    if (propertyId) filter.propertyId = propertyId;

    // Search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { source: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    // Date filtering (same logic as GET /leads)
    if (dateFilter) {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

      switch (dateFilter) {
        case 'today':
          filter.createdAt = { $gte: startOfDay, $lt: endOfDay };
          break;
        case 'yesterday':
          const yesterdayStart = new Date(startOfDay);
          yesterdayStart.setDate(yesterdayStart.getDate() - 1);
          const yesterdayEnd = new Date(endOfDay);
          yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
          filter.createdAt = { $gte: yesterdayStart, $lt: yesterdayEnd };
          break;
        case 'this_week':
          const startOfWeek = new Date(startOfDay);
          startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
          filter.createdAt = { $gte: startOfWeek };
          break;
        case 'last_week':
          const lastWeekStart = new Date(startOfDay);
          lastWeekStart.setDate(startOfDay.getDate() - startOfDay.getDay() - 7);
          const lastWeekEnd = new Date(startOfDay);
          lastWeekEnd.setDate(startOfDay.getDate() - startOfDay.getDay());
          filter.createdAt = { $gte: lastWeekStart, $lt: lastWeekEnd };
          break;
        case 'this_month':
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          filter.createdAt = { $gte: startOfMonth };
          break;
        case 'last_month':
          const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);
          filter.createdAt = { $gte: lastMonthStart, $lt: lastMonthEnd };
          break;
        case 'this_year':
          const startOfYear = new Date(now.getFullYear(), 0, 1);
          filter.createdAt = { $gte: startOfYear };
          break;
      }
    }

    const leads = await Lead.find(filter)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('propertyId', 'title location price propertyType')
      .sort({ createdAt: -1 });

    if (format === 'csv') {
      // Generate CSV with enhanced information
      const csvHeader = 'Name,Email,Phone,Property,Property Location,Property Price,Property Type,Status,Priority,Source,Assigned To,Assigned To Email,Created By,Created Date,Last Updated,Notes,Timeline,Requirements\n';
      const csvRows = leads.map(lead => {
        const propertyName = lead.propertyId ? lead.propertyId.title : 'No Property';
        const propertyLocation = lead.propertyId ? lead.propertyId.location?.address || 'N/A' : 'N/A';
        const propertyPrice = lead.propertyId ?
          `${lead.propertyId.price?.value || 'N/A'} ${lead.propertyId.price?.unit || ''}` : 'N/A';
        const propertyType = lead.propertyId ? lead.propertyId.propertyType : 'N/A';
        const assignedToName = lead.assignedTo ? lead.assignedTo.name : 'Unassigned';
        const assignedToEmail = lead.assignedTo ? lead.assignedTo.email : 'N/A';
        const createdByName = lead.createdBy ? lead.createdBy.name : 'N/A';
        const createdDate = new Date(lead.createdAt).toLocaleDateString();
        const lastUpdated = new Date(lead.updatedAt).toLocaleDateString();
        const notes = (lead.notes || '').replace(/,/g, ';').replace(/\n/g, ' ');
        const timeline = lead.timeline || 'N/A';
        const requirements = lead.requirements || 'N/A';

        return `"${lead.name}","${lead.email}","${lead.phone || ''}","${propertyName}","${propertyLocation}","${propertyPrice}","${propertyType}","${lead.status}","${lead.priority}","${lead.source}","${assignedToName}","${assignedToEmail}","${createdByName}","${createdDate}","${lastUpdated}","${notes}","${timeline}","${requirements}"`;
      }).join('\n');

      const csvContent = csvHeader + csvRows;

      // Generate dynamic filename based on filters
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');

      let filename = `leads_${dateStr}_${timeStr}`;
      if (status) filename += `_status-${status}`;
      if (propertyId) filename += `_property-${propertyId}`;
      if (dateFilter) filename += `_${dateFilter}`;
      if (search) filename += `_search-${search.substring(0, 10)}`;
      filename += '.csv';

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(csvContent);
    } else {
      res.json({ leads });
    }
  } catch (error) {
    console.error('Export leads error:', error);
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
  body('propertyId').optional().isMongoId().withMessage('Property ID must be a valid MongoDB ObjectId'),
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
    console.log('🔍 Lead count:', leadCount);
    console.log('🔍 Subscription:', subscription);
    if (subscription && subscription.features.maxLeads !== -1 && leadCount >= subscription.features.maxLeads) {
      return res.status(403).json({
        message: 'Lead limit reached. Please upgrade your plan to add more leads.'
      });
    }

    // Handle empty string for propertyId - convert to null
    const leadData = {
      ...req.body,
      companyId: req.user.companyId,
      createdBy: req.user.id
    };

    if (leadData.propertyId === '') {
      leadData.propertyId = null;
    }

    // Detect platform from lead data
    const platform = notificationService.detectPlatform(leadData);
    leadData.platform = platform;

    const lead = new Lead(leadData);
    await lead.save();

    const populatedLead = await Lead.findById(lead._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    // Send real-time notification
    try {
      console.log('🔔 Creating lead notification for:', populatedLead.name);
      console.log('👤 Assigned to:', populatedLead.assignedTo?._id);
      console.log('👤 Created by:', populatedLead.createdBy?._id);
      await notificationService.createLeadNotification(populatedLead, platform);
      console.log('✅ Lead notification created successfully');
    } catch (notificationError) {
      console.error('❌ Failed to send lead notification:', notificationError);
      // Don't fail the lead creation if notification fails
    }

    // Send email notification (if email service is available)
    try {
      // This would be handled by your existing email service
      console.log('Lead created successfully:', populatedLead.name);
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // Don't fail the lead creation if email fails
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

    // Handle empty string for propertyId - convert to null
    const updateData = { ...req.body };
    if (updateData.propertyId === '') {
      updateData.propertyId = null;
    }

    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, companyId: req.user.companyId },
      updateData,
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
          // Status change notification - can be implemented later
          console.log('Lead status changed from', oldLead.status, 'to', lead.status);
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
// @desc    Assign lead to agent (Admin only)
// @access  Private
router.put('/:id/assign', [
  body('assignedTo').optional().isMongoId().withMessage('Valid agent ID is required')
], async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin users can assign leads' });
    }

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
        role: 'agent' // Only agents can be assigned leads
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
        console.log('🔔 Sending lead assignment notification...');
        await notificationService.createLeadAssignmentNotification(lead, lead.assignedTo, req.user);
        console.log('✅ Lead assignment notification sent successfully');
      } catch (notificationError) {
        console.error('❌ Failed to send assignment notification:', notificationError);
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
    // Build match criteria based on user role
    const matchCriteria = { companyId: req.user.companyId };
    if (req.user.role === 'agent') {
      matchCriteria.assignedTo = req.user.id;
    }

    const stats = await Lead.aggregate([
      { $match: matchCriteria },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalLeads = await Lead.countDocuments(matchCriteria);
    const recentLeads = await Lead.find(matchCriteria)
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
    // Build match criteria based on user role
    const matchCriteria = { companyId: req.user.companyId };
    if (req.user.role === 'agent') {
      matchCriteria.assignedTo = req.user.id;
    }

    const platformStats = await Lead.aggregate([
      { $match: matchCriteria },
      {
        $group: {
          _id: { $ifNull: ['$source', 'Not specified'] },
          count: { $sum: 1 }
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

// Import property matching service
const propertyMatchingService = require('../services/propertyMatchingService');

// @route   GET /api/leads/:id/property-recommendations
// @desc    Get property recommendations for a lead
// @access  Private
router.get('/:id/property-recommendations', authMiddleware, async (req, res) => {
  try {
    const leadId = req.params.id;
    const limit = parseInt(req.query.limit) || 5;

    // Verify lead belongs to user's company
    const lead = await Lead.findOne({
      _id: leadId,
      companyId: req.user.companyId
    });

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    const recommendations = await propertyMatchingService.getPropertyRecommendations(leadId, { limit });

    res.json({
      success: true,
      data: recommendations,
      count: recommendations.length
    });

  } catch (error) {
    console.error('Get property recommendations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/leads/:id/property-interest
// @desc    Track property interest for a lead
// @access  Private
router.post('/:id/property-interest', [
  body('propertyId').isMongoId().withMessage('Valid property ID required'),
  body('interestLevel').optional().isIn(['high', 'medium', 'low']).withMessage('Invalid interest level'),
  body('status').optional().isIn(['interested', 'viewing', 'negotiating', 'offered', 'rejected', 'purchased']).withMessage('Invalid status'),
  body('notes').optional().isString().withMessage('Notes must be a string')
], authMiddleware, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const leadId = req.params.id;
    const { propertyId, interestLevel, status, notes } = req.body;

    // Verify lead belongs to user's company
    const lead = await Lead.findOne({
      _id: leadId,
      companyId: req.user.companyId
    });

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Verify property belongs to user's company
    const Property = require('../models/Property');
    const property = await Property.findOne({
      _id: propertyId,
      companyId: req.user.companyId
    });

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const updatedLead = await propertyMatchingService.trackPropertyInterest(leadId, propertyId, {
      interestLevel,
      status,
      notes
    });

    res.json({
      success: true,
      message: 'Property interest tracked successfully',
      data: updatedLead
    });

  } catch (error) {
    console.error('Track property interest error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/leads/:id/property-interests
// @desc    Get all property interests for a lead
// @access  Private
router.get('/:id/property-interests', authMiddleware, async (req, res) => {
  try {
    const leadId = req.params.id;

    const lead = await Lead.findOne({
      _id: leadId,
      companyId: req.user.companyId
    }).populate('propertyInterests.propertyId', 'title price location propertyType bedrooms bathrooms area images status');

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    res.json({
      success: true,
      data: lead.propertyInterests || []
    });

  } catch (error) {
    console.error('Get property interests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/leads/:id/property-interests/:interestId
// @desc    Update property interest for a lead
// @access  Private
router.put('/:id/property-interests/:interestId', [
  body('interestLevel').optional().isIn(['high', 'medium', 'low']).withMessage('Invalid interest level'),
  body('status').optional().isIn(['interested', 'viewing', 'negotiating', 'offered', 'rejected', 'purchased']).withMessage('Invalid status'),
  body('notes').optional().isString().withMessage('Notes must be a string')
], authMiddleware, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const leadId = req.params.id;
    const interestId = req.params.interestId;
    const { interestLevel, status, notes } = req.body;

    const lead = await Lead.findOne({
      _id: leadId,
      companyId: req.user.companyId
    });

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    const interest = lead.propertyInterests.id(interestId);
    if (!interest) {
      return res.status(404).json({ message: 'Property interest not found' });
    }

    // Update interest
    if (interestLevel) interest.interestLevel = interestLevel;
    if (status) interest.status = status;
    if (notes !== undefined) interest.notes = notes;
    interest.lastContacted = new Date();

    await lead.save();

    res.json({
      success: true,
      message: 'Property interest updated successfully',
      data: interest
    });

  } catch (error) {
    console.error('Update property interest error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/leads/:id/property-interests/:interestId
// @desc    Remove property interest for a lead
// @access  Private
router.delete('/:id/property-interests/:interestId', authMiddleware, async (req, res) => {
  try {
    const leadId = req.params.id;
    const interestId = req.params.interestId;

    const lead = await Lead.findOne({
      _id: leadId,
      companyId: req.user.companyId
    });

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    const interest = lead.propertyInterests.id(interestId);
    if (!interest) {
      return res.status(404).json({ message: 'Property interest not found' });
    }

    interest.remove();
    await lead.save();

    res.json({
      success: true,
      message: 'Property interest removed successfully'
    });

  } catch (error) {
    console.error('Remove property interest error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
