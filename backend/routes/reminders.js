const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const {
  createReminder,
  getReminders,
  getReminder,
  updateReminder,
  deleteReminder
} = require('../controllers/reminderController');

// All routes are protected
router.use(authenticateToken);

router.get('/', getReminders);
router.post('/', createReminder);
router.get('/:id', getReminder);
router.put('/:id', updateReminder);
router.delete('/:id', deleteReminder);

module.exports = router;
