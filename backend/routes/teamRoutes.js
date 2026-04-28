const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getAllTeams, getTeam, createTeam, updateTeam,
  deleteTeam, addCommit, getStats, handleWebhook
} = require('../controllers/teamController');

const router = express.Router();

// Public
router.get('/', getAllTeams);
router.get('/stats', protect, authorize('admin'), getStats);
router.get('/:id', getTeam);

router.post('/', protect, authorize('admin'), createTeam);
router.patch('/:id', protect, authorize('admin', 'participant'), updateTeam);
router.delete('/:id', protect, authorize('admin'), deleteTeam);

// Participant – push a commit to their team
router.post('/:id/commit', protect, authorize('admin', 'participant'), addCommit);

// Webhook route (Public, called by GitHub)
router.post('/:id/webhook', handleWebhook);

module.exports = router;
