const Team = require('../models/Team');

/**
 * GET /teams
 * Public – list all teams with summary fields
 */
const getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find()
      .select('name repo status lastCommitAt members recentCommits')
      .sort({ lastCommitAt: -1 });

    res.status(200).json({ success: true, count: teams.length, data: teams });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch teams.' });
  }
};

/**
 * GET /teams/:id
 * Public – single team detail
 */
const getTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id).populate('owner', 'name email');
    if (!team) return res.status(404).json({ success: false, message: 'Team not found.' });
    res.status(200).json({ success: true, data: team });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch team.' });
  }
};

/**
 * POST /teams
 * Admin only – create a new team
 */
const createTeam = async (req, res) => {
  try {
    const { name, repo, members, status } = req.body;

    const existing = await Team.findOne({ name });
    if (existing) {
      return res.status(409).json({ success: false, message: 'A team with this name already exists.' });
    }

    const team = await Team.create({ name, repo, members, status });
    res.status(201).json({ success: true, data: team });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Failed to create team.' });
  }
};

/**
 * PATCH /teams/:id
 * Admin only – update team fields
 */
const updateTeam = async (req, res) => {
  try {
    const { name, repo, members, status } = req.body;
    const team = await Team.findByIdAndUpdate(
      req.params.id,
      { name, repo, members, status },
      { new: true, runValidators: true }
    );
    if (!team) return res.status(404).json({ success: false, message: 'Team not found.' });
    res.status(200).json({ success: true, data: team });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update team.' });
  }
};

/**
 * DELETE /teams/:id
 * Admin only – remove a team
 */
const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found.' });
    res.status(200).json({ success: true, message: 'Team deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete team.' });
  }
};

/**
 * POST /teams/:id/commit
 * Participant (team owner) – push a new commit entry
 */
const addCommit = async (req, res) => {
  try {
    const { message, author, sha } = req.body;
    if (!message || !author) {
      return res.status(400).json({ success: false, message: 'Commit message and author are required.' });
    }

    const team = await Team.findByIdAndUpdate(
      req.params.id,
      {
        $push: { recentCommits: { $each: [{ message, author, sha }], $position: 0, $slice: 10 } },
        $set: { lastCommitAt: new Date(), status: 'active' },
      },
      { new: true }
    );

    if (!team) return res.status(404).json({ success: false, message: 'Team not found.' });
    res.status(200).json({ success: true, data: team });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to add commit.' });
  }
};

/**
 * GET /teams/stats
 * Admin – aggregate counts for dashboard
 */
const getStats = async (req, res) => {
  try {
    const [total, active, idle, inactive] = await Promise.all([
      Team.countDocuments(),
      Team.countDocuments({ status: 'active' }),
      Team.countDocuments({ status: 'idle' }),
      Team.countDocuments({ status: 'inactive' }),
    ]);
    res.status(200).json({ success: true, data: { total, active, idle, inactive } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch stats.' });
  }
};

/**
 * POST /teams/:id/webhook
 * Public – GitHub webhook endpoint to automatically add commits
 */
const handleWebhook = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = req.body;

    // Check if it's a push event
    if (payload.commits && payload.commits.length > 0) {
      const newCommits = payload.commits.map((c) => ({
        message: c.message,
        author: c.author?.name || c.author?.username || 'GitHub User',
        timestamp: c.timestamp || new Date(),
      }));

      const team = await Team.findByIdAndUpdate(
        id,
        {
          $push: {
            recentCommits: {
              $each: newCommits.reverse(), // most recent first
              $position: 0,
              $slice: 10, // keep only last 10
            },
          },
          lastCommitAt: new Date(),
          status: 'active', // receiving commits means they are active
        },
        { new: true }
      );

      if (!team) return res.status(404).json({ success: false, message: 'Team not found.' });
      
      // Emit socket event if we want real-time dashboard updates for commits
      if (req.io) req.io.emit('team_updated', team);

      return res.status(200).json({ success: true, message: 'Webhook processed', data: team });
    }

    res.status(200).json({ success: true, message: 'No commits to process' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Webhook failed.' });
  }
};

module.exports = { getAllTeams, getTeam, createTeam, updateTeam, deleteTeam, addCommit, getStats, handleWebhook };
