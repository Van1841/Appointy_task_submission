const Reminder = require('../models/Reminder');
const Upload = require('../models/Upload');

// Create reminder
const createReminder = async (req, res) => {
  try {
    const { uploadId, reminderDate, message, triggerType } = req.body;

    if (!uploadId || !reminderDate) {
      return res.status(400).json({
        error: 'Upload ID and reminder date are required'
      });
    }

    // Verify upload belongs to user
    const upload = await Upload.findOne({
      _id: uploadId,
      user: req.user._id
    });

    if (!upload) {
      return res.status(404).json({ error: 'Upload not found' });
    }

    const reminder = new Reminder({
      user: req.user._id,
      upload: uploadId,
      reminderDate: new Date(reminderDate),
      message,
      triggerType: triggerType || 'notification'
    });

    await reminder.save();

    // Update upload with reminder reference
    upload.reminder = reminder._id;
    await upload.save();

    res.status(201).json({
      message: 'Reminder created successfully',
      reminder
    });
  } catch (error) {
    console.error('Create reminder error:', error);
    res.status(500).json({ error: 'Server error creating reminder' });
  }
};

// Get all reminders
const getReminders = async (req, res) => {
  try {
    const { upcoming, triggered } = req.query;

    let query = { user: req.user._id };

    if (upcoming === 'true') {
      query.reminderDate = { $gte: new Date() };
      query.isTriggered = false;
    }

    if (triggered !== undefined) {
      query.isTriggered = triggered === 'true';
    }

    const reminders = await Reminder.find(query)
      .populate('upload')
      .sort({ reminderDate: 1 });

    res.json({ reminders });
  } catch (error) {
    console.error('Get reminders error:', error);
    res.status(500).json({ error: 'Server error fetching reminders' });
  }
};

// Get single reminder
const getReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('upload');

    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    res.json({ reminder });
  } catch (error) {
    console.error('Get reminder error:', error);
    res.status(500).json({ error: 'Server error fetching reminder' });
  }
};

// Update reminder
const updateReminder = async (req, res) => {
  try {
    const { reminderDate, message, triggerType, isTriggered } = req.body;

    const reminder = await Reminder.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    if (reminderDate) reminder.reminderDate = new Date(reminderDate);
    if (message !== undefined) reminder.message = message;
    if (triggerType) reminder.triggerType = triggerType;
    if (isTriggered !== undefined) reminder.isTriggered = isTriggered;

    await reminder.save();

    res.json({
      message: 'Reminder updated successfully',
      reminder
    });
  } catch (error) {
    console.error('Update reminder error:', error);
    res.status(500).json({ error: 'Server error updating reminder' });
  }
};

// Delete reminder
const deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    // Remove reminder reference from upload
    await Upload.findByIdAndUpdate(
      reminder.upload,
      { $unset: { reminder: 1 } }
    );

    res.json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    console.error('Delete reminder error:', error);
    res.status(500).json({ error: 'Server error deleting reminder' });
  }
};

// Mark reminder as triggered (called by cron job)
const triggerReminder = async (reminderId) => {
  try {
    const reminder = await Reminder.findById(reminderId);

    if (reminder && !reminder.isTriggered) {
      reminder.isTriggered = true;
      await reminder.save();
      console.log(`Reminder ${reminderId} triggered`);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Trigger reminder error:', error);
    return false;
  }
};

module.exports = {
  createReminder,
  getReminders,
  getReminder,
  updateReminder,
  deleteReminder,
  triggerReminder
};
