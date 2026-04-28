const express = require('express');
const { exportReport } = require('../controllers/exportController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, authorize('admin'), exportReport);

module.exports = router;
