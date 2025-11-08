const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const {
  getThreads,
  getThread,
  createThread,
  updateThread,
  deleteThread,
  addToThread,
  generateThreads
} = require('../controllers/threadController');

// All routes are protected
router.use(authenticateToken);

router.get('/', getThreads);
router.post('/', createThread);
router.post('/generate', generateThreads);  // AI-powered thread generation
router.get('/:id', getThread);
router.put('/:id', updateThread);
router.delete('/:id', deleteThread);
router.post('/:id/add', addToThread);

module.exports = router;
