const express = require('express');
const { getLeaderboard, updateTeamScore } = require('../controllers/leaderboardController');
const { getPredictions } = require('../controllers/predictiveController');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

router.use(protect);

router.get('/', getLeaderboard);
router.get('/predictions', authorize('admin'), getPredictions);
router.patch('/:id/score', authorize('admin'), updateTeamScore);

module.exports = router;
