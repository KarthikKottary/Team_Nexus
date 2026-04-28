const axios = require('axios');
const Team = require('../models/Team');

/**
 * @route   POST /api/github/fetch
 * @desc    Fetch GitHub repository commit data
 * @access  Protected
 */
const fetchGithubData = async (req, res) => {
  try {
    const { repoUrl, teamId } = req.body;

    if (!repoUrl || !teamId) {
      return res.status(400).json({ success: false, message: 'repoUrl and teamId are required' });
    }

    // Extract owner and repo from URL
    // Expected format: https://github.com/owner/repo
    const regex = /github\.com\/([^/]+)\/([^/]+)/;
    const match = repoUrl.match(regex);

    if (!match) {
      return res.status(400).json({ success: false, message: 'Invalid GitHub URL' });
    }

    const owner = match[1];
    // Strip trailing .git if present
    const repo = match[2].replace(/\.git$/, '');

    // Fetch commit data from GitHub API
    // Using per_page=1 to get the latest commit efficiently for timestamp
    const config = {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        // 'Authorization': `token ${process.env.GITHUB_TOKEN}` // Optional, to increase rate limits
      }
    };

    const commitsResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/commits`, config);

    if (!commitsResponse.data || commitsResponse.data.length === 0) {
      return res.status(404).json({ success: false, message: 'No commits found for this repository' });
    }

    const lastCommitTime = commitsResponse.data[0].commit.author.date;

    // To get the total number of commits reliably, you'd usually read the Link header from a paginated request.
    // For simplicity without auth, we'll try to estimate or count up to 100 recent commits
    const allCommitsResponse = await axios.get(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=100`, config);
    const totalCommits = allCommitsResponse.data.length;

    // Determine activity (Active if last commit was within 24 hours)
    const lastCommitDate = new Date(lastCommitTime);
    const now = new Date();
    const diffHours = Math.abs(now - lastCommitDate) / 36e5;
    const activityStatus = diffHours < 24 ? 'Active' : 'Inactive';

    // Update Team Database
    const team = await Team.findById(teamId);
    if (team) {
      team.repo = repoUrl;
      // You could store totalCommits and activityStatus in the team model
      // team.commitCount = totalCommits;
      // team.status = activityStatus;
      await team.save();
    }

    return res.json({
      success: true,
      data: {
        owner,
        repo,
        totalCommits,
        lastCommitTime,
        activityStatus,
        rateLimitRemaining: allCommitsResponse.headers['x-ratelimit-remaining']
      }
    });

  } catch (error) {
    console.error('GitHub Fetch Error:', error.message);
    if (error.response && error.response.status === 403) {
      return res.status(429).json({ success: false, message: 'GitHub API rate limit exceeded. Try again later.' });
    }
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ success: false, message: 'Repository not found or is private.' });
    }
    return res.status(500).json({ success: false, message: 'Server error fetching GitHub data' });
  }
};

module.exports = { fetchGithubData };
