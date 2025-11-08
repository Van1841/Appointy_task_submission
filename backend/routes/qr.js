const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  generateQRToken,
  verifyQRToken,
  mobileUpload,
  mobileFileUpload
} = require('../controllers/qrController');

// Generate QR token (protected - requires auth)
router.post('/generate', authenticateToken, generateQRToken);

// Verify token (public - for mobile)
router.get('/verify/:token', verifyQRToken);

// Mobile upload endpoints (public - uses token auth)
router.post('/mobile-upload', mobileUpload);
router.post('/mobile-upload/file', upload.single('file'), mobileFileUpload);

module.exports = router;
