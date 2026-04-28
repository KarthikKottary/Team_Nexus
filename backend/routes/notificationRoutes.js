const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const Notification = require('../models/Notification');

const router = express.Router();

/**
 * GET /admin/notifications
 * Admin only - Fetch all notifications
 */
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate('user_id', 'name email')
      .populate('team_id', 'name')
      .sort({ timestamp: -1 });
    
    res.status(200).json({ success: true, count: notifications.length, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
  }
});

module.exports = router;
