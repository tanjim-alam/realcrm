const express = require('express');
const { body, validationResult } = require('express-validator');
const Company = require('../models/Company');
const User = require('../models/User');
const Lead = require('../models/Lead');
const Property = require('../models/Property');
const Subscription = require('../models/Subscription');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// @route   GET /api/admin/companies
// @desc    Get all companies (Super admin only)
// @access  Private (Super admin)
router.get('/companies', roleMiddleware(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    
    // Build filter object
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const companies = await Company.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Company.countDocuments(filter);

    res.json({
      companies,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users in the company
// @access  Private (Admin only)
router.get('/users', roleMiddleware(['admin']), async (req, res) => {
  try {
    const users = await User.find({ companyId: req.user.companyId })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/users
// @desc    Create new user (Admin only)
// @access  Private (Admin only)
router.post('/users', [
  roleMiddleware(['admin']),
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['admin', 'agent']).withMessage('Invalid role')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Check subscription limits
    const subscription = await Subscription.findOne({ companyId: req.user.companyId });
    const userCount = await User.countDocuments({ companyId: req.user.companyId });
    
    if (subscription && subscription.features.maxUsers !== -1 && userCount >= subscription.features.maxUsers) {
      return res.status(403).json({ 
        message: 'User limit reached. Please upgrade your plan to add more users.' 
      });
    }

    const user = new User({
      companyId: req.user.companyId,
      name,
      email,
      password,
      role
    });

    await user.save();

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user (Admin only)
// @access  Private (Admin only)
router.put('/users/:id', [
  roleMiddleware(['admin']),
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Please provide a valid email'),
  body('role').optional().isIn(['admin', 'agent']).withMessage('Invalid role'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findOneAndUpdate(
      { _id: req.params.id, companyId: req.user.companyId },
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user (Admin only)
// @access  Private (Admin only)
router.delete('/users/:id', roleMiddleware(['admin']), async (req, res) => {
  try {
    // Prevent admin from deleting themselves
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const user = await User.findOneAndDelete({
      _id: req.params.id,
      companyId: req.user.companyId
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private (Admin only)
router.get('/dashboard', roleMiddleware(['admin']), async (req, res) => {
  try {
    const [
      totalLeads,
      totalProperties,
      totalUsers,
      leadsByStatus,
      propertiesByStatus,
      recentLeads,
      recentProperties
    ] = await Promise.all([
      Lead.countDocuments({ companyId: req.user.companyId }),
      Property.countDocuments({ companyId: req.user.companyId }),
      User.countDocuments({ companyId: req.user.companyId }),
      Lead.aggregate([
        { $match: { companyId: req.user.companyId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Property.aggregate([
        { $match: { companyId: req.user.companyId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Lead.find({ companyId: req.user.companyId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('assignedTo', 'name'),
      Property.find({ companyId: req.user.companyId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('listedBy', 'name')
    ]);

    const subscription = await Subscription.findOne({ companyId: req.user.companyId });

    res.json({
      stats: {
        totalLeads,
        totalProperties,
        totalUsers
      },
      leadsByStatus,
      propertiesByStatus,
      recentLeads,
      recentProperties,
      subscription: subscription ? {
        plan: subscription.plan,
        features: subscription.features
      } : null
    });
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
