const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getAllAlerts, createAlert, resolveAlert, deleteAlert } = require('../controllers/alertController');

const router = express.Router();

// Admin sees all alerts
router.get('/', protect, authorize('admin'), getAllAlerts);

// Any logged-in user can trigger an alert
router.post('/', protect, createAlert);

// Admin-only actions
router.patch('/:id/resolve', protect, authorize('admin'), resolveAlert);
router.delete('/:id', protect, authorize('admin'), deleteAlert);

module.exports = router;
