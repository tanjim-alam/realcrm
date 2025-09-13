const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const User = require('../models/User');
const Property = require('../models/Property');
const { authMiddleware } = require('../middleware/auth');

// @route   GET /api/analytics/leads/overview
// @desc    Get lead analytics overview
// @access  Private
router.get('/leads/overview', authMiddleware, async (req, res) => {
  try {
    const { companyId } = req.user;
    const { period = '30d' } = req.query; // 7d, 30d, 90d, 1y

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Total leads in period
    const totalLeads = await Lead.countDocuments({
      companyId,
      createdAt: { $gte: startDate }
    });

    // Leads by status
    const leadsByStatus = await Lead.aggregate([
      {
        $match: {
          companyId: companyId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Leads by source
    const leadsBySource = await Lead.aggregate([
      {
        $match: {
          companyId: companyId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Leads by priority
    const leadsByPriority = await Lead.aggregate([
      {
        $match: {
          companyId: companyId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // Conversion funnel
    const conversionFunnel = {
      new: await Lead.countDocuments({
        companyId,
        status: 'new',
        createdAt: { $gte: startDate }
      }),
      contacted: await Lead.countDocuments({
        companyId,
        status: 'contacted',
        createdAt: { $gte: startDate }
      }),
      visit: await Lead.countDocuments({
        companyId,
        status: 'visit',
        createdAt: { $gte: startDate }
      }),
      offer: await Lead.countDocuments({
        companyId,
        status: 'offer',
        createdAt: { $gte: startDate }
      }),
      closed: await Lead.countDocuments({
        companyId,
        status: 'closed',
        createdAt: { $gte: startDate }
      }),
      lost: await Lead.countDocuments({
        companyId,
        status: 'lost',
        createdAt: { $gte: startDate }
      })
    };

    // Calculate conversion rates
    const conversionRates = {
      newToContacted: conversionFunnel.new > 0 ? (conversionFunnel.contacted / conversionFunnel.new * 100).toFixed(1) : 0,
      contactedToVisit: conversionFunnel.contacted > 0 ? (conversionFunnel.visit / conversionFunnel.contacted * 100).toFixed(1) : 0,
      visitToOffer: conversionFunnel.visit > 0 ? (conversionFunnel.offer / conversionFunnel.visit * 100).toFixed(1) : 0,
      offerToClosed: conversionFunnel.offer > 0 ? (conversionFunnel.closed / conversionFunnel.offer * 100).toFixed(1) : 0,
      overallConversion: conversionFunnel.new > 0 ? (conversionFunnel.closed / conversionFunnel.new * 100).toFixed(1) : 0
    };

    // Daily lead trends (last 30 days)
    const dailyTrends = await Lead.aggregate([
      {
        $match: {
          companyId: companyId,
          createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    res.json({
      period,
      totalLeads,
      leadsByStatus,
      leadsBySource,
      leadsByPriority,
      conversionFunnel,
      conversionRates,
      dailyTrends
    });

  } catch (error) {
    console.error('Analytics overview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/analytics/agents/performance
// @desc    Get agent performance analytics
// @access  Private
router.get('/agents/performance', authMiddleware, async (req, res) => {
  try {
    const { companyId } = req.user;
    const { period = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get all agents
    const agents = await User.find({
      companyId,
      role: { $in: ['admin', 'agent'] },
      isActive: true
    }).select('name email role leadCapacity specializations');

    // Get performance data for each agent
    const agentPerformance = await Promise.all(
      agents.map(async (agent) => {
        // Total leads assigned
        const totalLeads = await Lead.countDocuments({
          companyId,
          assignedTo: agent._id,
          createdAt: { $gte: startDate }
        });

        // Leads by status
        const leadsByStatus = await Lead.aggregate([
          {
            $match: {
              companyId,
              assignedTo: agent._id,
              createdAt: { $gte: startDate }
            }
          },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ]);

        // Conversion rate
        const closedLeads = await Lead.countDocuments({
          companyId,
          assignedTo: agent._id,
          status: 'closed',
          createdAt: { $gte: startDate }
        });

        const conversionRate = totalLeads > 0 ? (closedLeads / totalLeads * 100).toFixed(1) : 0;

        // Current active leads
        const activeLeads = await Lead.countDocuments({
          companyId,
          assignedTo: agent._id,
          status: { $nin: ['closed', 'lost'] }
        });

        // Response time (average time from lead creation to first contact)
        const responseTimeData = await Lead.aggregate([
          {
            $match: {
              companyId,
              assignedTo: agent._id,
              status: { $in: ['contacted', 'visit', 'offer', 'closed'] },
              createdAt: { $gte: startDate }
            }
          },
          {
            $project: {
              responseTime: {
                $subtract: ['$updatedAt', '$createdAt']
              }
            }
          },
          {
            $group: {
              _id: null,
              avgResponseTime: { $avg: '$responseTime' }
            }
          }
        ]);

        const avgResponseTime = responseTimeData.length > 0 
          ? Math.round(responseTimeData[0].avgResponseTime / (1000 * 60 * 60)) // Convert to hours
          : 0;

        return {
          agent: {
            _id: agent._id,
            name: agent.name,
            email: agent.email,
            role: agent.role,
            leadCapacity: agent.leadCapacity,
            specializations: agent.specializations
          },
          totalLeads,
          activeLeads,
          closedLeads,
          conversionRate: parseFloat(conversionRate),
          avgResponseTime,
          leadsByStatus,
          capacityUtilization: agent.leadCapacity > 0 ? (activeLeads / agent.leadCapacity * 100).toFixed(1) : 0
        };
      })
    );

    // Sort by conversion rate
    agentPerformance.sort((a, b) => b.conversionRate - a.conversionRate);

    res.json({
      period,
      agentPerformance
    });

  } catch (error) {
    console.error('Agent performance analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/analytics/properties/overview
// @desc    Get property analytics overview
// @access  Private
router.get('/properties/overview', authMiddleware, async (req, res) => {
  try {
    const { companyId } = req.user;
    const { period = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Total properties
    const totalProperties = await Property.countDocuments({
      companyId,
      createdAt: { $gte: startDate }
    });

    // Properties by status
    const propertiesByStatus = await Property.aggregate([
      {
        $match: {
          companyId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Properties by type
    const propertiesByType = await Property.aggregate([
      {
        $match: {
          companyId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$propertyType',
          count: { $sum: 1 }
        }
      }
    ]);

    // Price range analysis
    const priceAnalysis = await Property.aggregate([
      {
        $match: {
          companyId,
          createdAt: { $gte: startDate },
          price: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: null,
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          totalValue: { $sum: '$price' }
        }
      }
    ]);

    res.json({
      period,
      totalProperties,
      propertiesByStatus,
      propertiesByType,
      priceAnalysis: priceAnalysis.length > 0 ? priceAnalysis[0] : null
    });

  } catch (error) {
    console.error('Property analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
