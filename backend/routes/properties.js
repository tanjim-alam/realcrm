const express = require('express');
const { body, validationResult } = require('express-validator');
const Property = require('../models/Property');
const Subscription = require('../models/Subscription');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// @route   GET /api/properties
// @desc    Get all properties for the company
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { status, propertyType, page = 1, limit = 10 } = req.query;

    // Build filter object
    const filter = { companyId: req.user.companyId };
    if (status) filter.status = status;
    if (propertyType) filter.propertyType = propertyType;

    const properties = await Property.find(filter)
      .populate('listedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Property.countDocuments(filter);

    res.json({
      properties,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/properties/:id
// @desc    Get single property
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findOne({
      _id: req.params.id,
      companyId: req.user.companyId
    }).populate('listedBy', 'name email');

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.json(property);
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/properties
// @desc    Create new property
// @access  Private
router.post('/', [
  body('title').notEmpty().withMessage('Title is required'),
  body('price.value').isNumeric().withMessage('Price value must be a number'),
  body('location.address').notEmpty().withMessage('Address is required'),
  body('location.city').notEmpty().withMessage('City is required'),
  body('propertyType').isIn(['apartment', 'house', 'villa', 'condo', 'townhouse', 'commercial', 'land', 'plot', 'farmhouse', 'penthouse', 'studio', 'other']).withMessage('Invalid property type'),
  body('status').optional().isIn(['available', 'pending', 'sold', 'rented', 'pre_launch', 'launched', 'under_construction', 'ready_to_move']),
  body('configuration.bathrooms').optional().isInt({ min: 0 }),
  body('configuration.balconies').optional().isInt({ min: 0 }),
  body('area.builtUp').optional().isNumeric({ min: 0 }),
  body('area.carpet').optional().isNumeric({ min: 0 }),
  body('area.superBuiltUp').optional().isNumeric({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check subscription limits
    const subscription = await Subscription.findOne({ companyId: req.user.companyId });
    const propertyCount = await Property.countDocuments({ companyId: req.user.companyId });

    if (subscription && subscription.features.maxProperties !== -1 && propertyCount >= subscription.features.maxProperties) {
      return res.status(403).json({
        message: 'Property limit reached. Please upgrade your plan to add more properties.'
      });
    }

    const propertyData = {
      ...req.body,
      companyId: req.user.companyId,
      listedBy: req.user._id
    };

    const property = new Property(propertyData);
    await property.save();

    const populatedProperty = await Property.findById(property._id)
      .populate('listedBy', 'name email');

    res.status(201).json(populatedProperty);
  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/properties/:id
// @desc    Update property
// @access  Private
router.put('/:id', [
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('price.value').optional().isNumeric().withMessage('Price value must be a number'),
  body('location.address').optional().notEmpty().withMessage('Address cannot be empty'),
  body('location.city').optional().notEmpty().withMessage('City cannot be empty'),
  body('propertyType').optional().isIn(['apartment', 'house', 'villa', 'condo', 'townhouse', 'commercial', 'land', 'plot', 'farmhouse', 'penthouse', 'studio', 'other']),
  body('status').optional().isIn(['available', 'pending', 'sold', 'rented', 'pre_launch', 'launched', 'under_construction', 'ready_to_move']),
  body('configuration.bathrooms').optional().isInt({ min: 0 }),
  body('configuration.balconies').optional().isInt({ min: 0 }),
  body('area.builtUp').optional().isNumeric({ min: 0 }),
  body('area.carpet').optional().isNumeric({ min: 0 }),
  body('area.superBuiltUp').optional().isNumeric({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const property = await Property.findOneAndUpdate(
      { _id: req.params.id, companyId: req.user.companyId },
      req.body,
      { new: true, runValidators: true }
    ).populate('listedBy', 'name email');

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.json(property);
  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/properties/:id
// @desc    Delete property
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const property = await Property.findOneAndDelete({
      _id: req.params.id,
      companyId: req.user.companyId
    });

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/properties/stats/summary
// @desc    Get properties statistics
// @access  Private
router.get('/stats/summary', async (req, res) => {
  try {
    const stats = await Property.aggregate([
      { $match: { companyId: req.user.companyId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalProperties = await Property.countDocuments({ companyId: req.user.companyId });
    const recentProperties = await Property.find({ companyId: req.user.companyId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('listedBy', 'name');

    res.json({
      statusCounts: stats,
      totalProperties,
      recentProperties
    });
  } catch (error) {
    console.error('Get properties stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
