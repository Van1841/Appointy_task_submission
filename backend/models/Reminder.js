const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  upload: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Upload',
    required: true
  },
  reminderDate: {
    type: Date,
    required: true
  },
  message: {
    type: String
  },
  isTriggered: {
    type: Boolean,
    default: false
  },
  triggerType: {
    type: String,
    enum: ['notification', 'email', 'both'],
    default: 'notification'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for querying upcoming reminders
reminderSchema.index({ reminderDate: 1, isTriggered: 1 });

module.exports = mongoose.model('Reminder', reminderSchema);
