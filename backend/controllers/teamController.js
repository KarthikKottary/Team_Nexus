const Team = require('../models/Team');

/**
 * GET /teams
 * Public – list all teams with summary fields
 */
const getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find()
      .select('name repo status lastCommitAt members recentCommits owner joinCode')
      .populate('members', 'name email role')
      .populate('owner', 'name email')
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
    const team = await Team.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email role');
      
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

const User = require('../models/User');
const Notification = require('../models/Notification');
const crypto = require('crypto');

/**
 * POST /teams/create
 * Participant - Create a new team and become the owner
 */
const createMyTeam = async (req, res) => {
  try {
    // Check if user is already in a team
    if (req.user.team) {
      return res.status(400).json({ success: false, message: 'You are already in a team.' });
    }

    const { name, college_name, repo } = req.body;
    if (!name || !college_name) {
      return res.status(400).json({ success: false, message: 'Team name and college name are required.' });
    }

    const existing = await Team.findOne({ name });
    if (existing) return res.status(409).json({ success: false, message: 'Team name is taken.' });

    // Generate random 6-character join code
    const joinCode = crypto.randomBytes(3).toString('hex').toUpperCase();

    const team = await Team.create({
      name,
      college_name,
      repo: repo || '',
      owner: req.user._id,
      members: [req.user._id],
      joinCode,
      status: 'pending', // < 2 members
    });

    // Update the user
    await User.findByIdAndUpdate(req.user._id, { team: team._id });

    // Create Notification for Admin
    const notification = await Notification.create({
      user_id: req.user._id,
      team_id: team._id,
      action: 'CREATED_TEAM',
    });
    
    // Notify Admin Dashboard via WebSockets
    const populatedNotification = await Notification.findById(notification._id)
      .populate('user_id', 'name')
      .populate('team_id', 'name');

    if (req.io) req.io.emit('team_created', populatedNotification);

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
 * POST /teams/join/:teamId
 * Participant - Join team via team ID
 */
const joinTeam = async (req, res) => {
  try {
    if (req.user.team) {
      return res.status(400).json({ success: false, message: 'You are already in a team.' });
    }

    const teamId = req.params.teamId;
    
    // Support joining by ObjectId or by joinCode
    let team;
    if (teamId.length === 24) { // valid ObjectId length
      team = await Team.findById(teamId);
    } else {
      team = await Team.findOne({ joinCode: teamId.toUpperCase() });
    }
    
    if (!team) return res.status(404).json({ success: false, message: 'Invalid team ID or join code.' });

    // Enforce max members rule
    if (team.members.length >= 4) {
      return res.status(400).json({ success: false, message: 'Team is full (max 4 members).' });
    }

    // Add user to team
    team.members.push(req.user._id);
    
    // Enforce minimum members logic for 'active' status
    if (team.members.length >= 2) {
      team.status = 'active';
    }
    
    await team.save();

    // Update user
    await User.findByIdAndUpdate(req.user._id, { team: team._id });

    // Create Notification for Admin
    const notification = await Notification.create({
      user_id: req.user._id,
      team_id: team._id,
      action: 'JOINED_TEAM',
    });

    // Notify Admin Dashboard via WebSockets
    const populatedNotification = await Notification.findById(notification._id)
      .populate('user_id', 'name')
      .populate('team_id', 'name');

    if (req.io) req.io.emit('member_joined', populatedNotification);
    if (req.io) req.io.emit('team_updated', team);

    res.status(200).json({ success: true, data: team });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to join team.' });
  }
};

/**
 * GET /teams/details
 * Participant - View my team details
 */
const getMyTeamDetails = async (req, res) => {
  try {
    if (!req.user.team) {
      return res.status(404).json({ success: false, message: 'You are not in a team yet.' });
    }

    const team = await Team.findById(req.user.team).populate('members', 'name email role');
    if (!team) return res.status(404).json({ success: false, message: 'Team not found.' });

    res.status(200).json({ success: true, data: team });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch team details.' });
  }
};

module.exports = { 
  getAllTeams, getTeam, createTeam, updateTeam, deleteTeam, 
  addCommit, getStats, handleWebhook,
  createMyTeam, joinTeam, getMyTeamDetails
};
