const express = require('express');
const { body, validationResult } = require('express-validator');
const Subscription = require('../models/Subscription');
const Company = require('../models/Company');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// @route   GET /api/subscription/status
// @desc    Get current subscription status
// @access  Private
router.get('/status', async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ companyId: req.user.companyId });

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    // Check if subscription is expired
    const isExpired = subscription.endDate && new Date() > subscription.endDate;

    res.json({
      ...subscription.toObject(),
      isExpired
    });
  } catch (error) {
    console.error('Get subscription status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/subscription/fix
// @desc    Fix subscription plan (set to Basic if not set)
// @access  Private
router.post('/fix', async (req, res) => {
  try {
    const companyId = req.user.companyId;

    console.log('🔧 Fixing subscription for company:', companyId);

    let subscription = await Subscription.findOne({ companyId });

    if (!subscription) {
      console.log('❌ No subscription found, creating Basic plan...');
      subscription = new Subscription({
        companyId,
        plan: 'basic',
        isActive: true
      });
      await subscription.save();
      console.log('✅ Basic subscription created');
    } else {
      console.log('🔄 Updating subscription to free plan with 10 maxLeads...');
      subscription.plan = 'free';
      subscription.isActive = true;
      // Force update features to match the current model
      subscription.features = {
        maxLeads: 10,
        maxProperties: 10,
        maxUsers: 2,
        hasAnalytics: false,
        hasCustomBranding: false
      };
      await subscription.save();
      console.log('✅ Subscription updated to free plan with 10 maxLeads');
    }

    // Get current lead count
    const Lead = require('../models/Lead');
    const leadCount = await Lead.countDocuments({ companyId });

    res.json({
      message: 'Subscription fixed successfully',
      subscription: {
        plan: subscription.plan,
        maxLeads: subscription.features.maxLeads,
        maxProperties: subscription.features.maxProperties,
        maxUsers: subscription.features.maxUsers,
        isActive: subscription.isActive
      },
      currentLeadCount: leadCount,
      remainingLeads: subscription.features.maxLeads === -1 ? 'Unlimited' : subscription.features.maxLeads - leadCount
    });

  } catch (error) {
    console.error('Fix subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/subscription/activate
// @desc    Activate/upgrade subscription plan
// @access  Private (Admin only)
router.post('/activate', [
  roleMiddleware(['admin']),
  body('plan').isIn(['free', 'basic', 'premium']).withMessage('Invalid plan type'),
  body('duration').optional().isInt({ min: 1 }).withMessage('Duration must be a positive integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { plan, duration = 30 } = req.body;

    let subscription = await Subscription.findOne({ companyId: req.user.companyId });

    if (!subscription) {
      // Create new subscription
      subscription = new Subscription({
        companyId: req.user.companyId,
        plan,
        startDate: new Date(),
        endDate: new Date(Date.now() + duration * 24 * 60 * 60 * 1000), // Add duration in days
        isActive: true
      });
    } else {
      // Update existing subscription
      subscription.plan = plan;
      subscription.startDate = new Date();
      subscription.endDate = new Date(Date.now() + duration * 24 * 60 * 60 * 1000);
      subscription.isActive = true;
    }

    await subscription.save();

    // Update company plan
    await Company.findByIdAndUpdate(req.user.companyId, { plan });

    res.json({
      message: 'Subscription activated successfully',
      subscription
    });
  } catch (error) {
    console.error('Activate subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/subscription/plans
// @desc    Get available subscription plans
// @access  Private
router.get('/plans', async (req, res) => {
  try {
    const plans = [
      {
        name: 'Free',
        plan: 'free',
        price: 0,
        duration: 'Unlimited',
        features: {
          maxLeads: 10,
          maxProperties: 10,
          maxUsers: 2,
          hasAnalytics: false,
          hasCustomBranding: false
        },
        description: 'Perfect for getting started'
      },
      {
        name: 'Basic',
        plan: 'basic',
        price: 29,
        duration: 'Monthly',
        features: {
          maxLeads: 500,
          maxProperties: 100,
          maxUsers: 5,
          hasAnalytics: true,
          hasCustomBranding: false
        },
        description: 'Great for growing businesses'
      },
      {
        name: 'Premium',
        plan: 'premium',
        price: 99,
        duration: 'Monthly',
        features: {
          maxLeads: -1,
          maxProperties: -1,
          maxUsers: -1,
          hasAnalytics: true,
          hasCustomBranding: true
        },
        description: 'For established real estate agencies'
      }
    ];

    res.json(plans);
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/subscription/usage
// @desc    Get current usage statistics
// @access  Private
router.get('/usage', async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ companyId: req.user.companyId });

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    // Get current usage
    const Lead = require('../models/Lead');
    const Property = require('../models/Property');
    const User = require('../models/User');

    const [leadCount, propertyCount, userCount] = await Promise.all([
      Lead.countDocuments({ companyId: req.user.companyId }),
      Property.countDocuments({ companyId: req.user.companyId }),
      User.countDocuments({ companyId: req.user.companyId })
    ]);

    const usage = {
      leads: {
        used: leadCount,
        limit: subscription.features.maxLeads,
        percentage: subscription.features.maxLeads === -1 ? 0 : (leadCount / subscription.features.maxLeads) * 100
      },
      properties: {
        used: propertyCount,
        limit: subscription.features.maxProperties,
        percentage: subscription.features.maxProperties === -1 ? 0 : (propertyCount / subscription.features.maxProperties) * 100
      },
      users: {
        used: userCount,
        limit: subscription.features.maxUsers,
        percentage: subscription.features.maxUsers === -1 ? 0 : (userCount / subscription.features.maxUsers) * 100
      }
    };

    res.json({
      subscription: subscription.plan,
      usage,
      features: subscription.features
    });
  } catch (error) {
    console.error('Get usage error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
