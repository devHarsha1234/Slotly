const Notification = require('../models/Notification');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id }).sort('-createdAt');
    res.json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification || notification.recipient.toString() !== req.user._id.toString()) {
      res.status(404);
      throw new Error('Notification not found');
    }

    notification.read = true;
    await notification.save();
    res.json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotifications, markRead };
