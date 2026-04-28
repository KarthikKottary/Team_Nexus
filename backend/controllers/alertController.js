const Alert = require('../models/Alert');

/**
 * GET /alerts
 * Admin only – all alerts, newest first
 */
const getAllAlerts = async (req, res) => {
  try {
    const filter = {};
    if (req.query.active !== undefined) filter.active = req.query.active === 'true';

    const alerts = await Alert.find(filter)
      .populate('team', 'name')
      .populate('triggeredBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: alerts.length, data: alerts });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch alerts.' });
  }
};

/**
 * POST /alerts
 * Participant – trigger a new emergency alert
 */
const createAlert = async (req, res) => {
  try {
    const { type, location, description, team } = req.body;

    if (!type || !location) {
      return res.status(400).json({ success: false, message: 'Alert type and location are required.' });
    }

    const alert = await Alert.create({
      type,
      location,
      description,
      team: team || null,
      triggeredBy: req.user._id,
    });

    const populated = await alert.populate([
      { path: 'team', select: 'name' },
      { path: 'triggeredBy', select: 'name email' },
    ]);

    // Emit realtime update to all connected clients (especially Admin Dashboard)
    if (req.io) req.io.emit('new_alert', populated);

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Failed to create alert.' });
  }
};

/**
 * PATCH /alerts/:id/resolve
 * Admin only – mark an alert as resolved
 */
const resolveAlert = async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { active: false, resolvedAt: new Date() },
      { new: true }
    );
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found.' });
    
    if (req.io) req.io.emit('alert_resolved', alert);
    
    res.status(200).json({ success: true, data: alert });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to resolve alert.' });
  }
};

/**
 * DELETE /alerts/:id
 * Admin only – permanently remove an alert
 */
const deleteAlert = async (req, res) => {
  try {
    const alert = await Alert.findByIdAndDelete(req.params.id);
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found.' });
    res.status(200).json({ success: true, message: 'Alert deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete alert.' });
  }
};

module.exports = { getAllAlerts, createAlert, resolveAlert, deleteAlert };
