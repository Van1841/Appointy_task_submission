const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const {
  getReflections,
  getLatestReflection,
  generateReflection
} = require('../controllers/reflectionController');

// All routes are protected
router.use(authenticateToken);

router.get('/', getReflections);
router.get('/latest', getLatestReflection);
router.post('/generate', generateReflection);

module.exports = router;
