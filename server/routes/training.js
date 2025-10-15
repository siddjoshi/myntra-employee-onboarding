const express = require('express');
const { TrainingModule, TrainingProgress } = require('../models/Training');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all training modules
router.get('/', authMiddleware, async (req, res) => {
  try {
    const modules = await TrainingModule.find()
      .populate('createdBy', 'firstName lastName')
      .sort({ order: 1 });

    // Get user's progress for each module
    const modulesWithProgress = await Promise.all(
      modules.map(async (module) => {
        const progress = await TrainingProgress.findOne({
          userId: req.user.userId,
          moduleId: module._id,
        });

        return {
          ...module.toObject(),
          userProgress: progress || {
            status: 'not_started',
            progress: 0,
          },
        };
      })
    );

    res.json({ modules: modulesWithProgress });
  } catch (error) {
    console.error('Get training modules error:', error);
    res.status(500).json({ error: 'Failed to fetch training modules.' });
  }
});

// Get specific training module
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const module = await TrainingModule.findById(req.params.id)
      .populate('createdBy', 'firstName lastName');

    if (!module) {
      return res.status(404).json({ error: 'Training module not found.' });
    }

    const progress = await TrainingProgress.findOne({
      userId: req.user.userId,
      moduleId: module._id,
    });

    res.json({
      module: {
        ...module.toObject(),
        userProgress: progress || {
          status: 'not_started',
          progress: 0,
        },
      },
    });
  } catch (error) {
    console.error('Get training module error:', error);
    res.status(500).json({ error: 'Failed to fetch training module.' });
  }
});

// Create training module (HR only)
router.post('/', authMiddleware, roleMiddleware('hr_admin'), async (req, res) => {
  try {
    const moduleData = {
      ...req.body,
      createdBy: req.user.userId,
    };

    const module = new TrainingModule(moduleData);
    await module.save();

    res.status(201).json({ 
      message: 'Training module created successfully', 
      module 
    });
  } catch (error) {
    console.error('Create training module error:', error);
    res.status(500).json({ error: 'Failed to create training module.' });
  }
});

// Update training progress
router.post('/:id/progress', authMiddleware, async (req, res) => {
  try {
    const { progress, status, quizScore } = req.body;

    let trainingProgress = await TrainingProgress.findOne({
      userId: req.user.userId,
      moduleId: req.params.id,
    });

    if (!trainingProgress) {
      trainingProgress = new TrainingProgress({
        userId: req.user.userId,
        moduleId: req.params.id,
        startedAt: Date.now(),
      });
    }

    trainingProgress.progress = progress || trainingProgress.progress;
    trainingProgress.status = status || trainingProgress.status;
    trainingProgress.lastAccessedAt = Date.now();

    if (quizScore !== undefined) {
      trainingProgress.quizScore = quizScore;
      trainingProgress.quizAttempts += 1;
    }

    if (status === 'completed' && !trainingProgress.completedAt) {
      trainingProgress.completedAt = Date.now();
    }

    await trainingProgress.save();

    res.json({ 
      message: 'Progress updated successfully', 
      progress: trainingProgress 
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ error: 'Failed to update progress.' });
  }
});

// Get user's training progress (HR/Manager only)
router.get('/user/:userId/progress', authMiddleware, roleMiddleware('hr_admin', 'manager'), async (req, res) => {
  try {
    const progressList = await TrainingProgress.find({ userId: req.params.userId })
      .populate('moduleId', 'title category duration isRequired');

    res.json({ progress: progressList });
  } catch (error) {
    console.error('Get user progress error:', error);
    res.status(500).json({ error: 'Failed to fetch user progress.' });
  }
});

module.exports = router;
