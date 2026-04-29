const Checkpoint = require('../models/Checkpoint');
const Team = require('../models/Team');

exports.createCheckpoint = async (req, res) => {
  try {
    const { title, description, deadline } = req.body;
    const checkpoint = new Checkpoint({
      title,
      description,
      deadline: new Date(deadline)
    });
    await checkpoint.save();
    res.status(201).json({ success: true, checkpoint });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getCheckpoints = async (req, res) => {
  try {
    const checkpoints = await Checkpoint.find().sort({ deadline: 1 });
    res.status(200).json({ success: true, checkpoints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markCheckpointComplete = async (req, res) => {
  try {
    const { checkpointId, teamId } = req.body;
    
    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    if (!team.completedCheckpoints.includes(checkpointId)) {
      team.completedCheckpoints.push(checkpointId);
      await team.save();
    }

    res.status(200).json({ success: true, team });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
