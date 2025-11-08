const Upload = require('../models/Upload');
const Thread = require('../models/Thread');
const { analyzeContent, detectDuplicate, findSimilarUploads } = require('../utils/claudeAI');
const { extractFromURL, extractFromPDF, generateThumbnail, detectContentType } = require('../utils/contentExtractor');

// Create new upload (URL, note, or dream)
const createUpload = async (req, res) => {
  try {
    const { type, url, content, title, category, timeCapsule } = req.body;

    if (!type) {
      return res.status(400).json({ error: 'Type is required' });
    }

    let uploadData = {
      user: req.user._id,
      type,
      title,
      category,
      content,
      url
    };

    // Extract content based on type
    if (type === 'url' && url) {
      const extracted = await extractFromURL(url);
      uploadData = {
        ...uploadData,
        title: title || extracted.title,
        content: extracted.content,
        metadata: extracted.metadata,
        thumbnail: extracted.thumbnail
      };
    }

    // AI Analysis
    const contentToAnalyze = uploadData.content || uploadData.url || '';
    if (contentToAnalyze) {
      const aiAnalysis = await analyzeContent(contentToAnalyze, type);
      uploadData.aiAnalysis = aiAnalysis;

      // Auto-categorize if not provided
      if (!uploadData.category) {
        uploadData.category = aiAnalysis.category;
      }
    }

    // Check for duplicates
    const userUploads = await Upload.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
    const duplicateCheck = await detectDuplicate(contentToAnalyze, userUploads);

    if (duplicateCheck.isDuplicate && duplicateCheck.similarity > 0.9) {
      uploadData.isDuplicate = true;
      uploadData.duplicateOf = duplicateCheck.duplicateOf;
    }

    // Time capsule
    if (timeCapsule) {
      uploadData.timeCapsule = {
        isLocked: true,
        unlockDate: new Date(timeCapsule.unlockDate),
        message: timeCapsule.message
      };
    }

    const upload = new Upload(uploadData);
    await upload.save();

    // Auto-create threads for similar content
    if (userUploads.length >= 2) {
      const allUploads = [upload, ...userUploads];
      const similarGroups = await findSimilarUploads(allUploads);

      for (const group of similarGroups) {
        if (group.uploads.includes(upload._id.toString())) {
          const existingThread = await Thread.findOne({
            user: req.user._id,
            uploads: { $in: group.uploads }
          });

          if (!existingThread && group.uploads.length >= 2) {
            const thread = new Thread({
              user: req.user._id,
              title: group.title,
              uploads: group.uploads,
              aiGenerated: true,
              similarity: group.similarity
            });
            await thread.save();

            // Update uploads with thread reference
            await Upload.updateMany(
              { _id: { $in: group.uploads } },
              { thread: thread._id }
            );
          }
        }
      }
    }

    res.status(201).json({
      message: 'Upload created successfully',
      upload: await Upload.findById(upload._id).populate('thread')
    });
  } catch (error) {
    console.error('Create upload error:', error);
    res.status(500).json({ error: 'Server error creating upload' });
  }
};

// Upload file (image or PDF)
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { title, category, timeCapsule } = req.body;
    const fileType = req.file.mimetype.startsWith('image/') ? 'image' : 'pdf';

    let uploadData = {
      user: req.user._id,
      type: fileType,
      title: title || req.file.originalname,
      category,
      filePath: req.file.path
    };

    // Extract content from PDF
    if (fileType === 'pdf') {
      const pdfContent = await extractFromPDF(req.file.path);
      uploadData.metadata = {
        extractedText: pdfContent.extractedText,
        pages: pdfContent.pages,
        ...pdfContent.metadata
      };
      uploadData.content = pdfContent.extractedText;
    }

    // Generate thumbnail for image
    if (fileType === 'image') {
      const thumbnail = await generateThumbnail(req.file.path);
      uploadData.thumbnail = thumbnail;
    }

    // AI Analysis
    const contentToAnalyze = uploadData.content || uploadData.title || '';
    if (contentToAnalyze) {
      const aiAnalysis = await analyzeContent(contentToAnalyze, fileType);
      uploadData.aiAnalysis = aiAnalysis;

      if (!uploadData.category) {
        uploadData.category = aiAnalysis.category;
      }
    }

    // Time capsule
    if (timeCapsule) {
      const parsedTimeCapsule = typeof timeCapsule === 'string' ? JSON.parse(timeCapsule) : timeCapsule;
      uploadData.timeCapsule = {
        isLocked: true,
        unlockDate: new Date(parsedTimeCapsule.unlockDate),
        message: parsedTimeCapsule.message
      };
    }

    const upload = new Upload(uploadData);
    await upload.save();

    res.status(201).json({
      message: 'File uploaded successfully',
      upload
    });
  } catch (error) {
    console.error('Upload file error:', error);
    res.status(500).json({ error: 'Server error uploading file' });
  }
};

// Get all uploads for user
const getUploads = async (req, res) => {
  try {
    const { category, type, search, page = 1, limit = 20 } = req.query;

    let query = { user: req.user._id };

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by type
    if (type) {
      query.type = type;
    }

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    const uploads = await Upload.find(query)
      .populate('thread')
      .populate('reminder')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Upload.countDocuments(query);

    res.json({
      uploads,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Get uploads error:', error);
    res.status(500).json({ error: 'Server error fetching uploads' });
  }
};

// Get single upload
const getUpload = async (req, res) => {
  try {
    const upload = await Upload.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('thread').populate('reminder');

    if (!upload) {
      return res.status(404).json({ error: 'Upload not found' });
    }

    res.json({ upload });
  } catch (error) {
    console.error('Get upload error:', error);
    res.status(500).json({ error: 'Server error fetching upload' });
  }
};

// Update upload
const updateUpload = async (req, res) => {
  try {
    const { title, category, content, timeCapsule } = req.body;

    const upload = await Upload.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!upload) {
      return res.status(404).json({ error: 'Upload not found' });
    }

    if (title) upload.title = title;
    if (category) upload.category = category;
    if (content) upload.content = content;
    if (timeCapsule) upload.timeCapsule = timeCapsule;

    await upload.save();

    res.json({
      message: 'Upload updated successfully',
      upload
    });
  } catch (error) {
    console.error('Update upload error:', error);
    res.status(500).json({ error: 'Server error updating upload' });
  }
};

// Delete upload
const deleteUpload = async (req, res) => {
  try {
    const upload = await Upload.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!upload) {
      return res.status(404).json({ error: 'Upload not found' });
    }

    res.json({ message: 'Upload deleted successfully' });
  } catch (error) {
    console.error('Delete upload error:', error);
    res.status(500).json({ error: 'Server error deleting upload' });
  }
};

// Get timeline data (for heatmap)
const getTimeline = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = {
      user: req.user._id
    };

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const uploads = await Upload.find(query).select('createdAt category type');

    // Group by date
    const timeline = {};
    uploads.forEach(upload => {
      const date = upload.createdAt.toISOString().split('T')[0];
      if (!timeline[date]) {
        timeline[date] = { count: 0, categories: {} };
      }
      timeline[date].count++;
      timeline[date].categories[upload.category] = (timeline[date].categories[upload.category] || 0) + 1;
    });

    res.json({ timeline });
  } catch (error) {
    console.error('Get timeline error:', error);
    res.status(500).json({ error: 'Server error fetching timeline' });
  }
};

module.exports = {
  createUpload,
  uploadFile,
  getUploads,
  getUpload,
  updateUpload,
  deleteUpload,
  getTimeline
};
