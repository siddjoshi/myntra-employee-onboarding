const mongoose = require('mongoose');

const trainingModuleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['company_culture', 'product_knowledge', 'compliance', 'technical', 'soft_skills', 'department_specific'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  duration: {
    type: Number, // in minutes
    required: true,
  },
  videoUrl: String,
  presentationUrl: String,
  resources: [{
    title: String,
    url: String,
    type: String,
  }],
  quiz: [{
    question: String,
    options: [String],
    correctAnswer: Number,
  }],
  passingScore: {
    type: Number,
    default: 70,
  },
  isRequired: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const trainingProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TrainingModule',
    required: true,
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed'],
    default: 'not_started',
  },
  progress: {
    type: Number,
    default: 0,
  },
  quizScore: Number,
  quizAttempts: {
    type: Number,
    default: 0,
  },
  startedAt: Date,
  completedAt: Date,
  lastAccessedAt: {
    type: Date,
    default: Date.now,
  },
});

const TrainingModule = mongoose.model('TrainingModule', trainingModuleSchema);
const TrainingProgress = mongoose.model('TrainingProgress', trainingProgressSchema);

module.exports = { TrainingModule, TrainingProgress };
