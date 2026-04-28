const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getAllTeams, getTeam, createTeam, updateTeam,
  deleteTeam, addCommit, getStats, handleWebhook,
  createMyTeam, joinTeam, getMyTeamDetails
} = require('../controllers/teamController');

const router = express.Router();

// Public
router.get('/', getAllTeams);
router.get('/stats', protect, authorize('admin'), getStats);

// Participant Team Management
router.post('/create', protect, authorize('participant'), createMyTeam);
router.post('/join/:teamId', protect, authorize('participant'), joinTeam);
router.get('/details', protect, authorize('participant'), getMyTeamDetails);

// Single team by ID (Put this after specific routes like /create or /stats)
router.get('/:id', getTeam);

router.post('/', protect, authorize('admin'), createTeam);
router.patch('/:id', protect, authorize('admin', 'participant'), updateTeam);
router.delete('/:id', protect, authorize('admin'), deleteTeam);

// Participant – push a commit to their team
router.post('/:id/commit', protect, authorize('admin', 'participant'), addCommit);

// Webhook route (Public, called by GitHub)
router.post('/:id/webhook', handleWebhook);

module.exports = router;
