const mongoose = require('mongoose');

const uploadSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['url', 'image', 'pdf', 'note', 'dream'],
    required: true
  },
  category: {
    type: String,
    enum: ['product', 'quote', 'book', 'todo', 'article', 'video', 'reel', 'tweet', 'code', 'research', 'dream', 'other'],
    default: 'other'
  },
  title: {
    type: String,
    trim: true
  },
  content: {
    type: String
  },
  url: {
    type: String
  },
  filePath: {
    type: String
  },
  thumbnail: {
    type: String
  },
  metadata: {
    author: String,
    date: Date,
    price: String,
    source: String,
    platform: String,
    tags: [String],
    extractedText: String,
    summary: String
  },
  aiAnalysis: {
    category: String,
    sentiment: String,
    keywords: [String],
    relatedTopics: [String],
    summary: String
  },
  thread: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Thread'
  },
  timeCapsule: {
    isLocked: {
      type: Boolean,
      default: false
    },
    unlockDate: Date,
    message: String
  },
  reminder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reminder'
  },
  isDuplicate: {
    type: Boolean,
    default: false
  },
  duplicateOf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Upload'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Comprehensive text index with weighted fields for optimal search
// Higher weight = more important in search results
uploadSchema.index({
  title: 'text',
  'aiAnalysis.keywords': 'text',
  'metadata.tags': 'text',
  content: 'text',
  'metadata.extractedText': 'text',
  'aiAnalysis.relatedTopics': 'text',
  category: 'text',
  type: 'text'
}, {
  weights: {
    title: 10,                        // Highest priority - exact title matches
    'aiAnalysis.keywords': 8,         // AI-extracted keywords
    'metadata.tags': 7,               // User-defined tags
    'aiAnalysis.relatedTopics': 5,    // Related topics
    category: 4,                       // Category
    type: 4,                           // Type
    content: 3,                        // Content text
    'metadata.extractedText': 2       // Extracted text from files
  },
  name: 'comprehensive_search_index'
});

// Additional compound indexes for filtered searches
uploadSchema.index({ user: 1, createdAt: -1 });
uploadSchema.index({ user: 1, category: 1, createdAt: -1 });
uploadSchema.index({ user: 1, type: 1, createdAt: -1 });
uploadSchema.index({ user: 1, category: 1, type: 1 });

uploadSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Upload', uploadSchema);
