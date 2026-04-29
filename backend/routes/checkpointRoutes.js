const express = require('express');
const { createCheckpoint, getCheckpoints, markCheckpointComplete } = require('../controllers/checkpointController');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

router.use(protect);

router.get('/', getCheckpoints);
router.post('/', authorize('admin'), createCheckpoint);
router.post('/complete', authorize('admin'), markCheckpointComplete);

module.exports = router;
