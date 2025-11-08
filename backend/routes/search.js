const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const {
  search,
  getSuggestions
} = require('../controllers/searchController');

// All routes are protected
router.use(authenticateToken);

router.get('/', search);
router.get('/suggestions', getSuggestions);

module.exports = router;
