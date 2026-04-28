const express = require('express');
const { fetchGithubData } = require('../controllers/githubController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Route: POST /api/github/fetch
router.post('/fetch', protect, fetchGithubData);

module.exports = router;
