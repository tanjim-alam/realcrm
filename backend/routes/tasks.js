const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { authMiddleware } = require('../middleware/auth');
const Task = require('../models/Task');
const Lead = require('../models/Lead');
const Property = require('../models/Property');
const User = require('../models/User');
const notificationService = require('../services/notificationService');

const router = express.Router();

// @route   GET /api/tasks/users
// @desc    Get all users in the company for task assignment
// @access  Private
router.get('/users', authMiddleware, async (req, res) => {
  try {
    const users = await User.find({ companyId: req.user.companyId })
      .select('name email role')
      .sort({ name: 1 });

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tasks
// @desc    Get all tasks for company with filters
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  try {
    const {
      status,
      priority,
      category,
      assignedTo,
      createdBy,
      relatedTo,
      relatedId,
      overdue,
      dueToday,
      search,
      page = 1,
      limit = 20
    } = req.query;

    const query = { companyId: req.user.companyId };

    // Apply filters
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (assignedTo) query.assignedTo = assignedTo;
    if (createdBy) query.createdBy = createdBy;
    if (relatedTo) query['relatedTo.type'] = relatedTo;
    if (relatedId) query['relatedTo.id'] = relatedId;

    // Overdue filter
    if (overdue === 'true') {
      query.status = { $in: ['pending', 'in_progress'] };
      query.dueDate = { $lt: new Date() };
    }

    // Due today filter
    if (dueToday === 'true') {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));
      query.status = { $in: ['pending', 'in_progress'] };
      query.dueDate = { $gte: startOfDay, $lte: endOfDay };
    }

    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ dueDate: 1, priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Manually populate related entities
    for (let task of tasks) {
      if (task.relatedTo && task.relatedTo.type !== 'none' && task.relatedTo.id) {
        let relatedModel;
        switch (task.relatedTo.type) {
          case 'lead':
            relatedModel = Lead;
            break;
          case 'property':
            relatedModel = Property;
            break;
          default:
            continue;
        }

        try {
          const relatedEntity = await relatedModel.findById(task.relatedTo.id);
          if (relatedEntity) {
            task.relatedTo.id = relatedEntity;
          }
        } catch (error) {
          console.error('Error populating related entity:', error);
        }
      }
    }

    const total = await Task.countDocuments(query);

    res.json({
      tasks,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tasks/my-tasks
// @desc    Get current user's tasks
// @access  Private
router.get('/my-tasks', authMiddleware, async (req, res) => {
  try {
    const { status, priority, category } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (category) filters.category = category;

    const tasks = await Task.getTasksByUser(req.user.id, req.user.companyId, filters);
    res.json(tasks);
  } catch (error) {
    console.error('Get my tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tasks/overdue
// @desc    Get overdue tasks
// @access  Private
router.get('/overdue', authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.getOverdueTasks(req.user.companyId);
    res.json(tasks);
  } catch (error) {
    console.error('Get overdue tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tasks/due-today
// @desc    Get tasks due today
// @access  Private
router.get('/due-today', authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.getTasksDueToday(req.user.companyId);
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks due today error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tasks/stats
// @desc    Get task statistics
// @access  Private
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const companyId = req.user.companyId;

    // Build match criteria based on user role
    const matchCriteria = { companyId };
    if (req.user.role === 'agent') {
      matchCriteria.assignedTo = req.user.id;
    }

    const [
      totalTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      overdueTasks,
      dueTodayTasks,
      highPriorityTasks,
      urgentTasks
    ] = await Promise.all([
      Task.countDocuments(matchCriteria),
      Task.countDocuments({ ...matchCriteria, status: 'pending' }),
      Task.countDocuments({ ...matchCriteria, status: 'in_progress' }),
      Task.countDocuments({ ...matchCriteria, status: 'completed' }),
      Task.countDocuments({
        ...matchCriteria,
        status: { $in: ['pending', 'in_progress'] },
        dueDate: { $lt: new Date() }
      }),
      Task.countDocuments({
        ...matchCriteria,
        status: { $in: ['pending', 'in_progress'] },
        dueDate: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lte: new Date(new Date().setHours(23, 59, 59, 999))
        }
      }),
      Task.countDocuments({ ...matchCriteria, priority: 'high' }),
      Task.countDocuments({ ...matchCriteria, priority: 'urgent' })
    ]);

    // Tasks by priority
    const tasksByPriority = await Task.aggregate([
      { $match: matchCriteria },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    // Tasks by status
    const tasksByStatus = await Task.aggregate([
      { $match: matchCriteria },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Tasks by category
    const tasksByCategory = await Task.aggregate([
      { $match: matchCriteria },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Recent completed tasks (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentCompleted = await Task.countDocuments({
      ...matchCriteria,
      status: 'completed',
      completedAt: { $gte: sevenDaysAgo }
    });

    res.json({
      overview: {
        total: totalTasks,
        pending: pendingTasks,
        inProgress: inProgressTasks,
        completed: completedTasks,
        overdue: overdueTasks,
        dueToday: dueTodayTasks,
        highPriority: highPriorityTasks,
        urgent: urgentTasks,
        recentCompleted
      },
      breakdown: {
        byPriority: tasksByPriority,
        byStatus: tasksByStatus,
        byCategory: tasksByCategory
      }
    });
  } catch (error) {
    console.error('Get task stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get single task
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      companyId: req.user.companyId
    })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('comments.user', 'name email');

    // Manually populate related entity if needed
    if (task && task.relatedTo && task.relatedTo.type !== 'none' && task.relatedTo.id) {
      let relatedModel;
      switch (task.relatedTo.type) {
        case 'lead':
          relatedModel = Lead;
          break;
        case 'property':
          relatedModel = Property;
          break;
      }

      if (relatedModel) {
        try {
          const relatedEntity = await relatedModel.findById(task.relatedTo.id);
          if (relatedEntity) {
            task.relatedTo.id = relatedEntity;
          }
        } catch (error) {
          console.error('Error populating related entity:', error);
        }
      }
    }

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/tasks
// @desc    Create new task
// @access  Private
router.post('/', [
  body('title').notEmpty().withMessage('Title is required'),
  body('assignedTo').notEmpty().withMessage('Assigned user is required for new tasks').custom((value) => {
    if (value === null || value === '') return false; // Require assignedTo for new tasks
    return require('mongoose').Types.ObjectId.isValid(value); // Validate MongoDB ObjectId
  }).withMessage('Valid assigned user ID is required'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('status').optional().isIn(['pending', 'in_progress', 'completed', 'cancelled']),
  body('category').optional().isIn(['follow_up', 'meeting', 'call', 'email', 'document', 'inspection', 'negotiation', 'closing', 'other']),
  body('relatedTo.type').optional().isIn(['lead', 'property', 'campaign', 'document', 'none']),
  body('dueDate').optional().isISO8601().withMessage('Invalid due date format')
], authMiddleware, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      assignedTo,
      priority = 'medium',
      status = 'pending',
      category = 'other',
      dueDate,
      relatedTo = { type: 'none', id: null },
      tags = [],
      estimatedHours,
      reminder
    } = req.body;

    // Clean up relatedTo.id - convert empty string to null
    if (relatedTo && relatedTo.id === '') {
      relatedTo.id = null;
    }

    // Verify assigned user exists and belongs to company (if assignedTo is provided)
    let assignedUser = null;
    if (assignedTo && assignedTo !== '' && assignedTo !== null) {
      assignedUser = await User.findOne({
        _id: assignedTo,
        companyId: req.user.companyId
      });

      if (!assignedUser) {
        return res.status(400).json({ message: 'Assigned user not found' });
      }

      // Hierarchical permission check
      // Admin can assign to anyone (admin, agent)
      // Agent can assign to other agents, but NOT to admins
      if (req.user.role === 'agent' && assignedUser.role === 'admin') {
        return res.status(403).json({
          message: 'Agents cannot assign tasks to admin users'
        });
      }
    }

    // Verify related entity if specified
    if (relatedTo.type !== 'none' && relatedTo.id) {
      let relatedModel;
      switch (relatedTo.type) {
        case 'lead':
          relatedModel = Lead;
          break;
        case 'property':
          relatedModel = Property;
          break;
        default:
          return res.status(400).json({ message: 'Invalid related entity type' });
      }

      const relatedEntity = await relatedModel.findOne({
        _id: relatedTo.id,
        companyId: req.user.companyId
      });

      if (!relatedEntity) {
        return res.status(400).json({ message: 'Related entity not found' });
      }
    }

    const task = new Task({
      companyId: req.user.companyId,
      title,
      description,
      assignedTo: assignedTo || null, // Handle null/empty assignedTo
      createdBy: req.user.id,
      priority,
      status,
      category,
      dueDate: dueDate ? new Date(dueDate) : null,
      relatedTo,
      tags,
      estimatedHours,
      reminder: reminder || { enabled: false }
    });

    await task.save();

    // Populate the task before returning
    await task.populate([
      { path: 'assignedTo', select: 'name email' },
      { path: 'createdBy', select: 'name email' }
    ]);

    // Send task assignment notification (only if task is assigned)
    if (assignedUser) {
      try {
        console.log('🔔 Sending task assignment notification...');
        await notificationService.createTaskAssignmentNotification(task, assignedUser, req.user);
        console.log('✅ Task assignment notification sent successfully');
      } catch (notificationError) {
        console.error('❌ Failed to send task assignment notification:', notificationError);
        // Don't fail the task creation if notification fails
      }
    }

    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      body: req.body
    });
    res.status(500).json({
      message: 'Server error',
      error: error.message,
      details: 'Check server logs for more information'
    });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update task
// @access  Private
router.put('/:id', [
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('assignedTo').optional().custom((value) => {
    if (value === null || value === '') return true; // Allow null/empty
    return require('mongoose').Types.ObjectId.isValid(value); // Validate MongoDB ObjectId
  }).withMessage('Valid assigned user ID is required'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('status').optional().isIn(['pending', 'in_progress', 'completed', 'cancelled']),
  body('category').optional().isIn(['follow_up', 'meeting', 'call', 'email', 'document', 'inspection', 'negotiation', 'closing', 'other']),
  body('dueDate').optional().isISO8601().withMessage('Invalid due date format'),
  body('progress').optional().isInt({ min: 0, max: 100 }).withMessage('Progress must be between 0 and 100')
], authMiddleware, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const task = await Task.findOne({
      _id: req.params.id,
      companyId: req.user.companyId
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const {
      title,
      description,
      assignedTo,
      priority,
      status,
      category,
      dueDate,
      progress,
      actualHours,
      tags,
      reminder,
      relatedTo
    } = req.body;

    // Clean up relatedTo.id - convert empty string to null
    if (relatedTo && relatedTo.id === '') {
      relatedTo.id = null;
    }

    // Update fields
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignedTo !== undefined) {
      if (assignedTo === null || assignedTo === '') {
        // Allow unassigning the task
        task.assignedTo = null;
      } else {
        // Verify assigned user exists
        const assignedUser = await User.findOne({
          _id: assignedTo,
          companyId: req.user.companyId
        });
        if (!assignedUser) {
          return res.status(400).json({ message: 'Assigned user not found' });
        }
        task.assignedTo = assignedTo;
      }
    }
    if (priority !== undefined) task.priority = priority;
    if (category !== undefined) task.category = category;
    if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;
    if (actualHours !== undefined) task.actualHours = actualHours;
    if (tags !== undefined) task.tags = tags;
    if (reminder !== undefined) task.reminder = { ...task.reminder, ...reminder };
    if (relatedTo !== undefined) task.relatedTo = relatedTo;

    // Handle status change
    if (status !== undefined) {
      task.status = status;
      if (status === 'completed') {
        task.completedAt = new Date();
        task.progress = 100;
      }
    }

    // Handle progress update
    if (progress !== undefined) {
      task.progress = progress;
      if (progress === 100 && task.status !== 'completed') {
        task.status = 'completed';
        task.completedAt = new Date();
      }
    }

    await task.save();

    // Populate the task before returning
    await task.populate([
      { path: 'assignedTo', select: 'name email' },
      { path: 'createdBy', select: 'name email' }
    ]);

    res.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/tasks/:id/comments
// @desc    Add comment to task
// @access  Private
router.post('/:id/comments', [
  body('comment').notEmpty().withMessage('Comment is required')
], authMiddleware, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const task = await Task.findOne({
      _id: req.params.id,
      companyId: req.user.companyId
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await task.addComment(req.user.id, req.body.comment);

    // Populate the updated task
    await task.populate([
      { path: 'assignedTo', select: 'name email' },
      { path: 'createdBy', select: 'name email' },
      { path: 'comments.user', select: 'name email' }
    ]);

    res.json(task);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/tasks/:id/status
// @desc    Update task status
// @access  Private
router.put('/:id/status', [
  body('status').isIn(['pending', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status')
], authMiddleware, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const task = await Task.findOne({
      _id: req.params.id,
      companyId: req.user.companyId
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.status = req.body.status;
    if (req.body.status === 'completed') {
      task.completedAt = new Date();
      task.progress = 100;
    }

    await task.save();

    res.json(task);
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/tasks/:id/progress
// @desc    Update task progress
// @access  Private
router.put('/:id/progress', [
  body('progress').isInt({ min: 0, max: 100 }).withMessage('Progress must be between 0 and 100')
], authMiddleware, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const task = await Task.findOne({
      _id: req.params.id,
      companyId: req.user.companyId
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await task.updateProgress(req.body.progress);

    res.json(task);
  } catch (error) {
    console.error('Update task progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Private
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      companyId: req.user.companyId
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


