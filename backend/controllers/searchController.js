const Upload = require('../models/Upload');
const { semanticSearch } = require('../utils/claudeAI');

// Enhanced semantic search with MongoDB text search and relevance scoring
const search = async (req, res) => {
  try {
    const { query, category, type } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Build aggregation pipeline for optimal search
    const pipeline = [];

    // Stage 1: Match user and filters
    const matchStage = { user: req.user._id };
    if (category) matchStage.category = category;
    if (type) matchStage.type = type;

    // Stage 2: Text search with scoring
    pipeline.push({
      $match: {
        ...matchStage,
        $text: { $search: query }
      }
    });

    // Stage 3: Add relevance score
    pipeline.push({
      $addFields: {
        score: { $meta: 'textScore' }
      }
    });

    // Stage 4: Sort by relevance score (highest first), then by date
    pipeline.push({
      $sort: {
        score: -1,
        createdAt: -1
      }
    });

    // Stage 5: Limit results
    pipeline.push({ $limit: 100 });

    // Execute search with text index
    let uploads = await Upload.aggregate(pipeline);

    // If no results from text search, try partial match fallback
    if (uploads.length === 0) {
      const searchPattern = new RegExp(query.split(/\s+/).join('|'), 'i');

      uploads = await Upload.find({
        ...matchStage,
        $or: [
          { title: searchPattern },
          { 'aiAnalysis.keywords': searchPattern },
          { 'metadata.tags': searchPattern },
          { content: searchPattern }
        ]
      })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    }

    // Populate thread data if needed
    if (uploads.length > 0) {
      await Upload.populate(uploads, { path: 'thread' });
    }

    // Use Claude AI for semantic re-ranking if available
    let rankedUploads = uploads;
    if (uploads.length > 0) {
      try {
        rankedUploads = await semanticSearch(query, uploads);
      } catch (aiError) {
        console.error('AI search error, using text search results:', aiError);
        // Fallback to text search results
        rankedUploads = uploads;
      }
    }

    res.json({
      query,
      results: rankedUploads.slice(0, 20),
      total: rankedUploads.length,
      searchMethod: uploads.length > 0 ? (uploads[0].score ? 'text' : 'regex') : 'none'
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      error: 'Server error during search',
      details: error.message
    });
  }
};

// Get search suggestions with keywords
const getSuggestions = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.json({ suggestions: [] });
    }

    // Get unique titles, tags, and keywords that match the query
    const uploads = await Upload.find({
      user: req.user._id,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { 'metadata.tags': { $regex: query, $options: 'i' } },
        { 'aiAnalysis.keywords': { $regex: query, $options: 'i' } },
        { 'aiAnalysis.relatedTopics': { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } }
      ]
    })
    .select('title category metadata.tags aiAnalysis.keywords aiAnalysis.relatedTopics')
    .limit(20);

    const suggestions = new Set();

    uploads.forEach(upload => {
      if (upload.title) suggestions.add(upload.title);
      if (upload.category) suggestions.add(upload.category);
      if (upload.metadata?.tags) {
        upload.metadata.tags.forEach(tag => suggestions.add(tag));
      }
      if (upload.aiAnalysis?.keywords) {
        upload.aiAnalysis.keywords.forEach(keyword => {
          if (keyword.toLowerCase().includes(query.toLowerCase())) {
            suggestions.add(keyword);
          }
        });
      }
      if (upload.aiAnalysis?.relatedTopics) {
        upload.aiAnalysis.relatedTopics.forEach(topic => {
          if (topic.toLowerCase().includes(query.toLowerCase())) {
            suggestions.add(topic);
          }
        });
      }
    });

    res.json({
      suggestions: Array.from(suggestions).slice(0, 10)
    });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ error: 'Server error getting suggestions' });
  }
};

module.exports = {
  search,
  getSuggestions
};
