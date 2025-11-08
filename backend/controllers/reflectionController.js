const WeeklyReflection = require('../models/WeeklyReflection');
const Upload = require('../models/Upload');
const { generateWeeklySummary } = require('../utils/claudeAI');

// Get all reflections for user
const getReflections = async (req, res) => {
  try {
    const reflections = await WeeklyReflection.find({ user: req.user._id })
      .populate('uploads')
      .sort({ weekStart: -1 });

    res.json({ reflections });
  } catch (error) {
    console.error('Get reflections error:', error);
    res.status(500).json({ error: 'Server error fetching reflections' });
  }
};

// Get latest reflection
const getLatestReflection = async (req, res) => {
  try {
    const reflection = await WeeklyReflection.findOne({ user: req.user._id })
      .populate('uploads')
      .sort({ weekStart: -1 });

    if (!reflection) {
      return res.status(404).json({ error: 'No reflections found' });
    }

    res.json({ reflection });
  } catch (error) {
    console.error('Get latest reflection error:', error);
    res.status(500).json({ error: 'Server error fetching reflection' });
  }
};

// Generate reflection for a specific week
const generateReflection = async (req, res) => {
  try {
    const { weekStart, weekEnd } = req.body;

    const start = weekStart ? new Date(weekStart) : getWeekStart();
    const end = weekEnd ? new Date(weekEnd) : getWeekEnd();

    // Check if reflection already exists for this week
    const existingReflection = await WeeklyReflection.findOne({
      user: req.user._id,
      weekStart: start
    });

    if (existingReflection) {
      return res.json({
        message: 'Reflection already exists for this week',
        reflection: existingReflection
      });
    }

    // Get uploads for this week
    const uploads = await Upload.find({
      user: req.user._id,
      createdAt: {
        $gte: start,
        $lte: end
      }
    });

    if (uploads.length === 0) {
      return res.status(400).json({ error: 'No uploads found for this week' });
    }

    // Generate AI summary
    const aiInsights = await generateWeeklySummary(uploads, start, end);

    // Calculate categories breakdown
    const categoriesBreakdown = new Map();
    const topicsCount = {};

    uploads.forEach(upload => {
      // Count categories
      categoriesBreakdown.set(
        upload.category,
        (categoriesBreakdown.get(upload.category) || 0) + 1
      );

      // Count topics
      if (upload.aiAnalysis?.relatedTopics) {
        upload.aiAnalysis.relatedTopics.forEach(topic => {
          topicsCount[topic] = (topicsCount[topic] || 0) + 1;
        });
      }
    });

    // Get top topics
    const topTopics = Object.entries(topicsCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic, count]) => ({ topic, count }));

    // Create reflection
    const reflection = new WeeklyReflection({
      user: req.user._id,
      weekStart: start,
      weekEnd: end,
      summary: aiInsights.summary,
      totalSaves: uploads.length,
      categoriesBreakdown,
      topTopics,
      uploads: uploads.map(u => u._id),
      aiInsights: {
        patterns: aiInsights.patterns,
        recommendations: aiInsights.recommendations,
        growthAreas: aiInsights.growthAreas
      }
    });

    await reflection.save();

    res.status(201).json({
      message: 'Weekly reflection generated successfully',
      reflection: await WeeklyReflection.findById(reflection._id).populate('uploads')
    });
  } catch (error) {
    console.error('Generate reflection error:', error);
    res.status(500).json({ error: 'Server error generating reflection' });
  }
};

// Helper functions to get week start and end
const getWeekStart = () => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust when day is Sunday
  const weekStart = new Date(now.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
};

const getWeekEnd = () => {
  const weekStart = getWeekStart();
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  return weekEnd;
};

module.exports = {
  getReflections,
  getLatestReflection,
  generateReflection
};
