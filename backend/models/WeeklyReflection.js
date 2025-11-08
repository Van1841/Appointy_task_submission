const mongoose = require('mongoose');

const weeklyReflectionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  weekStart: {
    type: Date,
    required: true
  },
  weekEnd: {
    type: Date,
    required: true
  },
  summary: {
    type: String
  },
  totalSaves: {
    type: Number,
    default: 0
  },
  categoriesBreakdown: {
    type: Map,
    of: Number
  },
  topTopics: [{
    topic: String,
    count: Number
  }],
  uploads: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Upload'
  }],
  aiInsights: {
    patterns: [String],
    recommendations: [String],
    growthAreas: [String]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure one reflection per user per week
weeklyReflectionSchema.index({ user: 1, weekStart: 1 }, { unique: true });

module.exports = mongoose.model('WeeklyReflection', weeklyReflectionSchema);
