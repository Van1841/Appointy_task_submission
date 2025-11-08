const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  createUpload,
  uploadFile,
  getUploads,
  getUpload,
  updateUpload,
  deleteUpload,
  getTimeline
} = require('../controllers/uploadController');

// All routes are protected
router.use(authenticateToken);

// Upload routes
router.post('/', createUpload);
router.post('/file', upload.single('file'), uploadFile);
router.get('/', getUploads);
router.get('/timeline', getTimeline);
router.get('/:id', getUpload);
router.put('/:id', updateUpload);
router.delete('/:id', deleteUpload);

module.exports = router;
