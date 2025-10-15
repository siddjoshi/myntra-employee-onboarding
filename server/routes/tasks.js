const express = require('express');
const Task = require('../models/Task');
const User = require('../models/User');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all tasks for current user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, category } = req.query;
    
    const query = { assignedTo: req.user.userId };
    if (status) query.status = status;
    if (category) query.category = category;

    const tasks = await Task.find(query)
      .populate('assignedBy', 'firstName lastName email')
      .sort({ order: 1, dueDate: 1 });

    res.json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks.' });
  }
});

// Get task by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'firstName lastName email')
      .populate('assignedBy', 'firstName lastName email')
      .populate('dependencies');

    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    res.json({ task });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Failed to fetch task.' });
  }
});

// Create new task (HR/Manager only)
router.post('/', authMiddleware, roleMiddleware('hr_admin', 'manager'), async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      assignedBy: req.user.userId,
    };

    const task = new Task(taskData);
    await task.save();

    // Update user's onboarding progress
    await updateOnboardingProgress(task.assignedTo);

    res.status(201).json({ message: 'Task created successfully', task });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task.' });
  }
});

// Update task status
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    task.status = status;
    if (notes) task.notes = notes;
    
    await task.save();

    // Update user's onboarding progress
    await updateOnboardingProgress(task.assignedTo);

    res.json({ message: 'Task status updated successfully', task });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task.' });
  }
});

// Delete task (HR only)
router.delete('/:id', authMiddleware, roleMiddleware('hr_admin'), async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task.' });
  }
});

// Get tasks for a specific user (HR/Manager only)
router.get('/user/:userId', authMiddleware, roleMiddleware('hr_admin', 'manager'), async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.params.userId })
      .populate('assignedBy', 'firstName lastName email')
      .sort({ order: 1, dueDate: 1 });

    res.json({ tasks });
  } catch (error) {
    console.error('Get user tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch user tasks.' });
  }
});

// Helper function to update onboarding progress
async function updateOnboardingProgress(userId) {
  const allTasks = await Task.find({ assignedTo: userId });
  const completedTasks = allTasks.filter(task => task.status === 'completed');
  
  const progress = allTasks.length > 0 
    ? Math.round((completedTasks.length / allTasks.length) * 100) 
    : 0;

  const onboardingStatus = progress === 100 ? 'completed' : 
                          progress > 0 ? 'in_progress' : 'pending';

  await User.findByIdAndUpdate(userId, {
    onboardingProgress: progress,
    onboardingStatus: onboardingStatus,
  });
}

module.exports = router;
