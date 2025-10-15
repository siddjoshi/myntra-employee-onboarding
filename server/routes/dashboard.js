const express = require('express');
const User = require('../models/User');
const Task = require('../models/Task');
const Document = require('../models/Document');
const { TrainingProgress } = require('../models/Training');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get dashboard statistics for current user
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get task statistics
    const allTasks = await Task.find({ assignedTo: userId });
    const completedTasks = allTasks.filter(t => t.status === 'completed').length;
    const pendingTasks = allTasks.filter(t => t.status === 'pending').length;
    const inProgressTasks = allTasks.filter(t => t.status === 'in_progress').length;
    
    // Get document statistics
    const allDocuments = await Document.find({ userId });
    const verifiedDocuments = allDocuments.filter(d => d.status === 'verified').length;
    const pendingDocuments = allDocuments.filter(d => d.status === 'pending').length;
    
    // Get training statistics
    const trainingProgress = await TrainingProgress.find({ userId });
    const completedTraining = trainingProgress.filter(t => t.status === 'completed').length;
    const inProgressTraining = trainingProgress.filter(t => t.status === 'in_progress').length;
    
    // Get user details
    const user = await User.findById(userId).select('onboardingProgress onboardingStatus joiningDate');

    res.json({
      stats: {
        tasks: {
          total: allTasks.length,
          completed: completedTasks,
          pending: pendingTasks,
          inProgress: inProgressTasks,
        },
        documents: {
          total: allDocuments.length,
          verified: verifiedDocuments,
          pending: pendingDocuments,
        },
        training: {
          total: trainingProgress.length,
          completed: completedTraining,
          inProgress: inProgressTraining,
        },
        onboarding: {
          progress: user.onboardingProgress,
          status: user.onboardingStatus,
          daysWithCompany: Math.floor((Date.now() - new Date(user.joiningDate)) / (1000 * 60 * 60 * 24)),
        },
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics.' });
  }
});

// Get all new hires (HR/Manager only)
router.get('/new-hires', authMiddleware, roleMiddleware('hr_admin', 'manager'), async (req, res) => {
  try {
    const newHires = await User.find({ role: 'new_hire' })
      .select('-password')
      .populate('manager', 'firstName lastName email')
      .populate('buddy', 'firstName lastName email')
      .sort({ joiningDate: -1 });

    res.json({ newHires });
  } catch (error) {
    console.error('Get new hires error:', error);
    res.status(500).json({ error: 'Failed to fetch new hires.' });
  }
});

// Get HR admin statistics
router.get('/hr-stats', authMiddleware, roleMiddleware('hr_admin'), async (req, res) => {
  try {
    const totalEmployees = await User.countDocuments({ role: 'new_hire' });
    const activeOnboarding = await User.countDocuments({ 
      role: 'new_hire', 
      onboardingStatus: { $in: ['pending', 'in_progress'] } 
    });
    const completedOnboarding = await User.countDocuments({ 
      role: 'new_hire', 
      onboardingStatus: 'completed' 
    });

    const pendingDocuments = await Document.countDocuments({ status: 'pending' });
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: 'completed' });

    // Get recent hires (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentHires = await User.countDocuments({
      role: 'new_hire',
      joiningDate: { $gte: thirtyDaysAgo },
    });

    res.json({
      stats: {
        employees: {
          total: totalEmployees,
          activeOnboarding,
          completedOnboarding,
          recentHires,
        },
        documents: {
          pendingVerification: pendingDocuments,
        },
        tasks: {
          total: totalTasks,
          completed: completedTasks,
          completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        },
      },
    });
  } catch (error) {
    console.error('Get HR stats error:', error);
    res.status(500).json({ error: 'Failed to fetch HR statistics.' });
  }
});

// Assign manager/buddy (HR only)
router.patch('/assign/:userId', authMiddleware, roleMiddleware('hr_admin'), async (req, res) => {
  try {
    const { managerId, buddyId } = req.body;
    const updates = {};
    
    if (managerId) updates.manager = managerId;
    if (buddyId) updates.buddy = buddyId;

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      updates,
      { new: true }
    ).populate('manager buddy');

    res.json({ 
      message: 'Assignment updated successfully', 
      user 
    });
  } catch (error) {
    console.error('Assign error:', error);
    res.status(500).json({ error: 'Failed to update assignment.' });
  }
});

module.exports = router;
