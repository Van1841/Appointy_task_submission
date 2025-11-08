const Thread = require('../models/Thread');
const Upload = require('../models/Upload');
const { findSimilarUploads } = require('../utils/claudeAI');

// Get all threads
const getThreads = async (req, res) => {
  try {
    const threads = await Thread.find({ user: req.user._id })
      .populate('uploads')
      .sort({ updatedAt: -1 });

    res.json({ threads });
  } catch (error) {
    console.error('Get threads error:', error);
    res.status(500).json({ error: 'Server error fetching threads' });
  }
};

// Get single thread
const getThread = async (req, res) => {
  try {
    const thread = await Thread.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('uploads');

    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    res.json({ thread });
  } catch (error) {
    console.error('Get thread error:', error);
    res.status(500).json({ error: 'Server error fetching thread' });
  }
};

// Create thread manually
const createThread = async (req, res) => {
  try {
    const { title, description, uploadIds } = req.body;

    if (!title || !uploadIds || uploadIds.length < 2) {
      return res.status(400).json({
        error: 'Title and at least 2 uploads are required'
      });
    }

    // Verify all uploads belong to user
    const uploads = await Upload.find({
      _id: { $in: uploadIds },
      user: req.user._id
    });

    if (uploads.length !== uploadIds.length) {
      return res.status(400).json({ error: 'Some uploads not found' });
    }

    const thread = new Thread({
      user: req.user._id,
      title,
      description,
      uploads: uploadIds,
      aiGenerated: false
    });

    await thread.save();

    // Update uploads with thread reference
    await Upload.updateMany(
      { _id: { $in: uploadIds } },
      { thread: thread._id }
    );

    res.status(201).json({
      message: 'Thread created successfully',
      thread: await Thread.findById(thread._id).populate('uploads')
    });
  } catch (error) {
    console.error('Create thread error:', error);
    res.status(500).json({ error: 'Server error creating thread' });
  }
};

// Update thread
const updateThread = async (req, res) => {
  try {
    const { title, description, uploadIds } = req.body;

    const thread = await Thread.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    if (title) thread.title = title;
    if (description !== undefined) thread.description = description;
    if (uploadIds) {
      // Verify uploads belong to user
      const uploads = await Upload.find({
        _id: { $in: uploadIds },
        user: req.user._id
      });

      if (uploads.length === uploadIds.length) {
        thread.uploads = uploadIds;
      }
    }

    await thread.save();

    res.json({
      message: 'Thread updated successfully',
      thread: await Thread.findById(thread._id).populate('uploads')
    });
  } catch (error) {
    console.error('Update thread error:', error);
    res.status(500).json({ error: 'Server error updating thread' });
  }
};

// Delete thread
const deleteThread = async (req, res) => {
  try {
    const thread = await Thread.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    // Remove thread reference from uploads
    await Upload.updateMany(
      { thread: thread._id },
      { $unset: { thread: 1 } }
    );

    res.json({ message: 'Thread deleted successfully' });
  } catch (error) {
    console.error('Delete thread error:', error);
    res.status(500).json({ error: 'Server error deleting thread' });
  }
};

// Add upload to thread
const addToThread = async (req, res) => {
  try {
    const { uploadId } = req.body;

    const thread = await Thread.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    // Verify upload belongs to user
    const upload = await Upload.findOne({
      _id: uploadId,
      user: req.user._id
    });

    if (!upload) {
      return res.status(404).json({ error: 'Upload not found' });
    }

    // Add to thread if not already present
    if (!thread.uploads.includes(uploadId)) {
      thread.uploads.push(uploadId);
      await thread.save();

      // Update upload
      upload.thread = thread._id;
      await upload.save();
    }

    res.json({
      message: 'Upload added to thread',
      thread: await Thread.findById(thread._id).populate('uploads')
    });
  } catch (error) {
    console.error('Add to thread error:', error);
    res.status(500).json({ error: 'Server error adding to thread' });
  }
};

// Auto-generate threads using AI based on keywords
const generateThreads = async (req, res) => {
  try {
    console.log('🧵 Starting thread generation for user:', req.user._id);

    // Get all user uploads
    const uploads = await Upload.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100);

    console.log(`📊 Found ${uploads.length} uploads`);

    if (uploads.length < 2) {
      return res.json({
        message: 'Need at least 2 uploads to create threads',
        threads: []
      });
    }

    // Use AI to find similar uploads
    let similarGroups = [];
    try {
      console.log('🤖 Attempting AI-powered thread generation...');
      similarGroups = await findSimilarUploads(uploads);
      console.log(`✅ AI found ${similarGroups.length} groups`);
    } catch (aiError) {
      console.error('⚠️ AI thread generation error, using keyword matching:', aiError);
      // Fallback to keyword-based matching
      similarGroups = findSimilarByKeywords(uploads);
      console.log(`📝 Keyword matching found ${similarGroups.length} groups`);
    }

    if (similarGroups.length === 0) {
      return res.json({
        message: 'No similar content groups found. Try uploading more items with related topics.',
        threads: []
      });
    }

    const createdThreads = [];

    // Create threads from similar groups
    for (const group of similarGroups) {
      console.log(`🔍 Processing group: ${group.title} with ${group.uploads?.length} uploads`);

      if (!group.uploads || group.uploads.length < 2) {
        console.log('⏭️ Skipping group with less than 2 uploads');
        continue;
      }

      // Check if thread already exists for these uploads
      const existingThread = await Thread.findOne({
        user: req.user._id,
        uploads: { $all: group.uploads },
        aiGenerated: true
      });

      if (existingThread) {
        console.log('⏭️ Thread already exists, skipping');
        continue;
      }

      const thread = new Thread({
        user: req.user._id,
        title: group.title || 'Related Content',
        description: group.description || `AI-generated thread based on similar content`,
        uploads: group.uploads,
        similarity: group.similarity || 0.8,
        aiGenerated: true
      });

      await thread.save();
      console.log(`✅ Created thread: ${thread.title}`);

      // Update uploads with thread reference
      await Upload.updateMany(
        { _id: { $in: group.uploads } },
        { thread: thread._id }
      );

      createdThreads.push(thread);
    }

    console.log(`🎉 Successfully created ${createdThreads.length} threads`);

    res.json({
      message: createdThreads.length > 0
        ? `Generated ${createdThreads.length} thread${createdThreads.length > 1 ? 's' : ''} successfully!`
        : 'No new threads created. Your content may already be organized.',
      threads: await Thread.find({ _id: { $in: createdThreads.map(t => t._id) } }).populate('uploads')
    });
  } catch (error) {
    console.error('❌ Generate threads error:', error);
    res.status(500).json({
      error: 'Failed to generate threads',
      details: error.message
    });
  }
};

// Fallback: Find similar uploads based on keywords
function findSimilarByKeywords(uploads) {
  const groups = [];
  const processed = new Set();

  uploads.forEach((upload, idx) => {
    if (processed.has(upload._id.toString())) return;

    const uploadKeywords = upload.aiAnalysis?.keywords || [];
    if (uploadKeywords.length === 0) return;

    const similar = [upload._id.toString()];
    processed.add(upload._id.toString());

    // Find uploads with matching keywords
    uploads.forEach((other, otherIdx) => {
      if (idx === otherIdx || processed.has(other._id.toString())) return;

      const otherKeywords = other.aiAnalysis?.keywords || [];

      // Calculate keyword overlap
      const commonKeywords = uploadKeywords.filter(k =>
        otherKeywords.some(ok => ok.toLowerCase() === k.toLowerCase())
      );

      const similarity = commonKeywords.length / Math.max(uploadKeywords.length, otherKeywords.length);

      if (similarity > 0.3 && commonKeywords.length >= 2) {
        similar.push(other._id.toString());
        processed.add(other._id.toString());
      }
    });

    if (similar.length >= 2) {
      // Get common keywords for title
      const firstUpload = uploads.find(u => u._id.toString() === similar[0]);
      const keywords = firstUpload.aiAnalysis?.keywords || [];

      groups.push({
        title: keywords.length > 0 ? `${keywords.slice(0, 2).join(', ')} Collection` : 'Related Content',
        uploads: similar,
        similarity: 0.7
      });
    }
  });

  return groups;
}

module.exports = {
  getThreads,
  getThread,
  createThread,
  updateThread,
  deleteThread,
  addToThread,
  generateThreads
};
