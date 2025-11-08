const QRToken = require('../models/QRToken');
const Upload = require('../models/Upload');
const { v4: uuidv4 } = require('uuid');
const { analyzeContent } = require('../utils/claudeAI');
const { extractFromURL, generateThumbnail, detectContentType } = require('../utils/contentExtractor');

// Generate QR token for mobile connection
const generateQRToken = async (req, res) => {
  try {
    // Generate unique token
    const token = uuidv4();

    // Set expiration to 10 minutes from now
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Create QR token document
    const qrToken = new QRToken({
      user: req.user._id,
      token,
      expiresAt
    });

    await qrToken.save();

    // Return token and expiry
    res.json({
      token,
      expiresAt,
      connectUrl: `${process.env.FRONTEND_URL}/mobile-upload?token=${token}`
    });
  } catch (error) {
    console.error('Generate QR token error:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
};

// Verify QR token validity
const verifyQRToken = async (req, res) => {
  try {
    const { token } = req.params;

    const qrToken = await QRToken.findOne({ token }).populate('user', 'name email');

    if (!qrToken) {
      return res.status(404).json({
        valid: false,
        error: 'Invalid token'
      });
    }

    // Check if expired
    if (new Date() > qrToken.expiresAt) {
      return res.status(401).json({
        valid: false,
        error: 'Token expired'
      });
    }

    // Check if already used
    if (qrToken.isUsed) {
      return res.status(401).json({
        valid: false,
        error: 'Token already used'
      });
    }

    res.json({
      valid: true,
      user: {
        name: qrToken.user.name,
        email: qrToken.user.email
      }
    });
  } catch (error) {
    console.error('Verify QR token error:', error);
    res.status(500).json({ error: 'Failed to verify token' });
  }
};

// Mobile upload endpoint
const mobileUpload = async (req, res) => {
  try {
    const { token, type, url, content, title } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    // Verify token
    const qrToken = await QRToken.findOne({ token });

    if (!qrToken) {
      return res.status(404).json({ error: 'Invalid token' });
    }

    // Check if expired
    if (new Date() > qrToken.expiresAt) {
      return res.status(401).json({ error: 'Token expired. Please scan a new QR code.' });
    }

    // Check if already used
    if (qrToken.isUsed) {
      return res.status(401).json({ error: 'Token already used. Please generate a new QR code.' });
    }

    // Create upload data
    let uploadData = {
      user: qrToken.user,
      type: type || 'note',
      title,
      content,
      url
    };

    // Extract content if URL
    if (type === 'url' && url) {
      try {
        const extracted = await extractFromURL(url);
        uploadData = {
          ...uploadData,
          title: title || extracted.title,
          content: extracted.content,
          metadata: extracted.metadata,
          thumbnail: extracted.thumbnail
        };
      } catch (extractError) {
        console.error('URL extraction error:', extractError);
        // Continue with basic data
      }
    }

    // AI Analysis
    const contentToAnalyze = uploadData.content || uploadData.url || uploadData.title || '';
    if (contentToAnalyze) {
      try {
        const aiAnalysis = await analyzeContent(contentToAnalyze, type);
        uploadData.aiAnalysis = aiAnalysis;

        if (!uploadData.category) {
          uploadData.category = aiAnalysis.category;
        }
      } catch (aiError) {
        console.error('AI analysis error:', aiError);
        // Continue without AI analysis
      }
    }

    // Create upload
    const upload = new Upload(uploadData);
    await upload.save();

    // Mark token as used
    qrToken.isUsed = true;
    await qrToken.save();

    // Emit socket event to dashboard
    const io = req.app.get('io');
    if (io) {
      io.to(`user-${qrToken.user}`).emit('new-mobile-upload', {
        upload,
        message: 'New upload received from mobile'
      });
    }

    res.status(201).json({
      message: 'Upload successful! You can close this page.',
      upload
    });
  } catch (error) {
    console.error('Mobile upload error:', error);
    res.status(500).json({ error: 'Failed to upload content' });
  }
};

// Mobile file upload endpoint
const mobileFileUpload = async (req, res) => {
  try {
    const { token, title } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Verify token
    const qrToken = await QRToken.findOne({ token });

    if (!qrToken) {
      return res.status(404).json({ error: 'Invalid token' });
    }

    if (new Date() > qrToken.expiresAt) {
      return res.status(401).json({ error: 'Token expired' });
    }

    if (qrToken.isUsed) {
      return res.status(401).json({ error: 'Token already used' });
    }

    // Detect file type
    const fileType = detectContentType(req.file.mimetype);

    let uploadData = {
      user: qrToken.user,
      type: fileType,
      title: title || req.file.originalname,
      filePath: req.file.path
    };

    // Generate thumbnail for images
    if (fileType === 'image') {
      try {
        const thumbnail = await generateThumbnail(req.file.path);
        uploadData.thumbnail = thumbnail;
      } catch (thumbError) {
        console.error('Thumbnail generation error:', thumbError);
      }
    }

    // Create upload
    const upload = new Upload(uploadData);
    await upload.save();

    // Mark token as used
    qrToken.isUsed = true;
    await qrToken.save();

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(`user-${qrToken.user}`).emit('new-mobile-upload', {
        upload,
        message: 'New upload received from mobile'
      });
    }

    res.status(201).json({
      message: 'File uploaded successfully!',
      upload
    });
  } catch (error) {
    console.error('Mobile file upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
};

module.exports = {
  generateQRToken,
  verifyQRToken,
  mobileUpload,
  mobileFileUpload
};
