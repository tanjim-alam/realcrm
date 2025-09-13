const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { authMiddleware: auth } = require('../middleware/auth');
const LeadScoring = require('../models/LeadScoring');
const Lead = require('../models/Lead');

const router = express.Router();

// @route   GET /api/lead-scoring
// @desc    Get all lead scoring models for company
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const scoringModels = await LeadScoring.find({
      companyId: req.user.companyId,
      isActive: true
    }).populate('createdBy', 'name email').sort({ isDefault: -1, createdAt: -1 });

    res.json(scoringModels);
  } catch (error) {
    console.error('Get lead scoring models error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/lead-scoring/default
// @desc    Get default lead scoring model
// @access  Private
router.get('/default', auth, async (req, res) => {
  try {
    let defaultModel = await LeadScoring.getDefaultForCompany(req.user.companyId);
    
    if (!defaultModel) {
      // Create default model if it doesn't exist
      defaultModel = await LeadScoring.createDefault(req.user.companyId, req.user.id);
    }

    res.json(defaultModel);
  } catch (error) {
    console.error('Get default scoring model error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/lead-scoring
// @desc    Create new lead scoring model
// @access  Private
router.post('/', auth, [
  body('name').notEmpty().withMessage('Name is required'),
  body('rules').isArray().withMessage('Rules must be an array'),
  body('rules.*.name').notEmpty().withMessage('Rule name is required'),
  body('rules.*.field').notEmpty().withMessage('Rule field is required'),
  body('rules.*.operator').isIn(['equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than', 'in', 'not_in', 'exists', 'not_exists']).withMessage('Invalid operator'),
  body('rules.*.score').isNumeric().withMessage('Score must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      description,
      rules,
      settings,
      isDefault
    } = req.body;

    // If setting as default, unset other default models
    if (isDefault) {
      await LeadScoring.updateMany(
        { companyId: req.user.companyId },
        { isDefault: false }
      );
    }

    const scoringModel = new LeadScoring({
      companyId: req.user.companyId,
      name,
      description,
      rules,
      settings: settings || {},
      isDefault: isDefault || false,
      createdBy: req.user.id
    });

    await scoringModel.save();
    await scoringModel.populate('createdBy', 'name email');

    res.status(201).json(scoringModel);
  } catch (error) {
    console.error('Create scoring model error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/lead-scoring/:id
// @desc    Get single lead scoring model
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const scoringModel = await LeadScoring.findOne({
      _id: req.params.id,
      companyId: req.user.companyId
    }).populate('createdBy', 'name email');

    if (!scoringModel) {
      return res.status(404).json({ message: 'Scoring model not found' });
    }

    res.json(scoringModel);
  } catch (error) {
    console.error('Get scoring model error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/lead-scoring/:id
// @desc    Update lead scoring model
// @access  Private
router.put('/:id', auth, [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('rules').optional().isArray().withMessage('Rules must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const scoringModel = await LeadScoring.findOne({
      _id: req.params.id,
      companyId: req.user.companyId
    });

    if (!scoringModel) {
      return res.status(404).json({ message: 'Scoring model not found' });
    }

    const {
      name,
      description,
      rules,
      settings,
      isDefault,
      isActive
    } = req.body;

    // If setting as default, unset other default models
    if (isDefault && !scoringModel.isDefault) {
      await LeadScoring.updateMany(
        { companyId: req.user.companyId },
        { isDefault: false }
      );
    }

    if (name) scoringModel.name = name;
    if (description !== undefined) scoringModel.description = description;
    if (rules) scoringModel.rules = rules;
    if (settings) scoringModel.settings = { ...scoringModel.settings, ...settings };
    if (isDefault !== undefined) scoringModel.isDefault = isDefault;
    if (isActive !== undefined) scoringModel.isActive = isActive;

    await scoringModel.save();
    await scoringModel.populate('createdBy', 'name email');

    res.json(scoringModel);
  } catch (error) {
    console.error('Update scoring model error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/lead-scoring/:id
// @desc    Delete lead scoring model
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const scoringModel = await LeadScoring.findOne({
      _id: req.params.id,
      companyId: req.user.companyId
    });

    if (!scoringModel) {
      return res.status(404).json({ message: 'Scoring model not found' });
    }

    if (scoringModel.isDefault) {
      return res.status(400).json({ message: 'Cannot delete default scoring model' });
    }

    await LeadScoring.findByIdAndDelete(req.params.id);

    res.json({ message: 'Scoring model deleted successfully' });
  } catch (error) {
    console.error('Delete scoring model error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/lead-scoring/:id/score-lead
// @desc    Score a specific lead
// @access  Private
router.post('/:id/score-lead', auth, [
  body('leadId').isMongoId().withMessage('Valid lead ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { leadId } = req.body;

    const scoringModel = await LeadScoring.findOne({
      _id: req.params.id,
      companyId: req.user.companyId,
      isActive: true
    });

    if (!scoringModel) {
      return res.status(404).json({ message: 'Scoring model not found' });
    }

    const lead = await Lead.findOne({
      _id: leadId,
      companyId: req.user.companyId
    });

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Calculate score
    const scoreResult = scoringModel.calculateScore(lead);
    const priority = scoringModel.getLeadPriority(scoreResult.score);

    // Update lead with new score
    lead.scoring = {
      score: scoreResult.score,
      maxScore: scoreResult.maxPossibleScore,
      percentage: scoreResult.percentage,
      priority,
      lastScored: new Date(),
      scoringModelId: scoringModel._id,
      scoreBreakdown: scoringModel.rules.map(rule => ({
        ruleName: rule.name,
        score: rule.isActive ? scoringModel.evaluateRule(
          scoringModel.getNestedValue(lead, rule.field),
          rule
        ) : 0,
        applied: rule.isActive
      }))
    };

    // Update lead priority if it's different
    if (lead.priority !== priority) {
      lead.priority = priority;
    }

    await lead.save();

    res.json({
      lead: lead,
      scoreResult,
      priority
    });
  } catch (error) {
    console.error('Score lead error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/lead-scoring/:id/score-all
// @desc    Score all leads for company
// @access  Private
router.post('/:id/score-all', auth, async (req, res) => {
  try {
    const scoringModel = await LeadScoring.findOne({
      _id: req.params.id,
      companyId: req.user.companyId,
      isActive: true
    });

    if (!scoringModel) {
      return res.status(404).json({ message: 'Scoring model not found' });
    }

    // Validate scoring model has required settings
    if (!scoringModel.settings) {
      console.error('Scoring model missing settings:', scoringModel);
      return res.status(400).json({ message: 'Scoring model is missing required settings' });
    }

    const leads = await Lead.find({
      companyId: req.user.companyId,
      status: { $in: ['new', 'contacted', 'visit', 'offer'] }
    });

    console.log(`Found ${leads.length} leads to score for company ${req.user.companyId}`);

    let scoredCount = 0;
    let updatedPriorities = 0;

    for (const lead of leads) {
      try {
        const scoreResult = scoringModel.calculateScore(lead);
        const priority = scoringModel.getLeadPriority(scoreResult.score);

        // Update lead with new score
        lead.scoring = {
          score: scoreResult.score,
          maxScore: scoreResult.maxPossibleScore,
          percentage: scoreResult.percentage,
          priority,
          lastScored: new Date(),
          scoringModelId: scoringModel._id,
          scoreBreakdown: scoringModel.rules.map(rule => ({
            ruleName: rule.name,
            score: rule.isActive ? scoringModel.evaluateRule(
              scoringModel.getNestedValue(lead, rule.field),
              rule
            ) : 0,
            applied: rule.isActive
          }))
        };

        // Update lead priority if it's different
        if (lead.priority !== priority) {
          lead.priority = priority;
          updatedPriorities++;
        }

        await lead.save();
        scoredCount++;
      } catch (leadError) {
        console.error(`Error scoring lead ${lead._id}:`, leadError);
        // Continue with other leads even if one fails
      }
    }

    // Update scoring model stats
    scoringModel.stats.totalLeadsScored = scoredCount;
    scoringModel.stats.lastUpdated = new Date();
    await scoringModel.save();

    res.json({
      message: 'All leads scored successfully',
      scoredCount,
      updatedPriorities,
      scoringModel: scoringModel
    });
  } catch (error) {
    console.error('Score all leads error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      scoringModelId: req.params.id,
      companyId: req.user.companyId
    });
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      details: 'Check server logs for more information'
    });
  }
});

// @route   GET /api/lead-scoring/:id/stats
// @desc    Get scoring model statistics
// @access  Private
router.get('/:id/stats', auth, async (req, res) => {
  try {
    const scoringModel = await LeadScoring.findOne({
      _id: req.params.id,
      companyId: req.user.companyId
    });

    if (!scoringModel) {
      return res.status(404).json({ message: 'Scoring model not found' });
    }

    // Get lead statistics by priority
    const leadStats = await Lead.aggregate([
      {
        $match: {
          companyId: req.user.companyId,
          'scoring.scoringModelId': scoringModel._id
        }
      },
      {
        $group: {
          _id: '$scoring.priority',
          count: { $sum: 1 },
          avgScore: { $avg: '$scoring.score' }
        }
      }
    ]);

    // Get score distribution
    const scoreDistribution = await Lead.aggregate([
      {
        $match: {
          companyId: req.user.companyId,
          'scoring.scoringModelId': scoringModel._id
        }
      },
      {
        $bucket: {
          groupBy: '$scoring.score',
          boundaries: [0, 20, 40, 60, 80, 100],
          default: '100+',
          output: {
            count: { $sum: 1 },
            avgScore: { $avg: '$scoring.score' }
          }
        }
      }
    ]);

    res.json({
      scoringModel: scoringModel,
      leadStats,
      scoreDistribution,
      totalLeads: leadStats.reduce((sum, stat) => sum + stat.count, 0)
    });
  } catch (error) {
    console.error('Get scoring stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;



