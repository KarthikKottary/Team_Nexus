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

    // SPAM PREVENTION: Check if user already triggered an active alert of this type recently
    const existingActive = await Alert.findOne({
      triggeredBy: req.user._id,
      active: true,
      createdAt: { $gte: new Date(Date.now() - 60000) } // within last 1 minute
    });

    if (existingActive) {
      return res.status(429).json({ success: false, message: 'You recently triggered an alert. Please wait before triggering another.' });
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
    if (req.io) {
      req.io.emit('new_alert', populated);

      // AUTOMATED RESPONSE SYSTEM (AGENT LOGIC)
      let broadcastPayload = null;

      if (type === 'Fire') {
        broadcastPayload = {
          alertId: alert._id,
          type: 'FIRE',
          message: 'Evacuate the building immediately. Do not use elevators.',
          location: location,
          timestamp: new Date().toISOString(),
          instructions: [
            '1. Leave belongings behind.',
            '2. Proceed to the nearest marked fire exit.',
            '3. Assemble at the designated outdoor safe zone.',
          ],
          mapUrl: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80', // Placeholder evacuation map
        };
      } else if (type === 'Medical') {
        broadcastPayload = {
          alertId: alert._id,
          type: 'MEDICAL',
          message: 'Medical emergency reported. Please stay clear of the area to allow medics access.',
          location: location,
          timestamp: new Date().toISOString(),
          instructions: [
            '1. Nearby coordinators have been notified.',
            '2. First aid kits are located at the front desk and lounge areas.',
            '3. Do not crowd the patient.',
          ],
          mapUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80', // Placeholder medical map
        };
      } else {
        // Generic or other types
        broadcastPayload = {
          alertId: alert._id,
          type: type.toUpperCase(),
          message: `${type} alert triggered at ${location}. Please await further instructions.`,
          location: location,
          timestamp: new Date().toISOString(),
          instructions: [
            '1. Remain calm.',
            '2. Follow instructions from coordinators.',
          ],
        };
      }

      if (broadcastPayload) {
        req.io.emit('emergency_broadcast', broadcastPayload);
      }
    }

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
    
    if (req.io) {
      req.io.emit('alert_resolved', alert);
      // Let clients know to clear the broadcast banner for this alert
      req.io.emit('emergency_cleared', { alertId: alert._id });
    }
    
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
