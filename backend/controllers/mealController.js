const Meal = require('../models/Meal');
const Team = require('../models/Team');

exports.scheduleMeal = async (req, res) => {
  try {
    const { name, startTime, batchIntervalMinutes, numBatches } = req.body;
    
    // Fetch all active teams
    const teams = await Team.find({ status: { $in: ['active', 'pending'] } });
    
    // Divide teams into batches to avoid crowding
    const batches = [];
    const _numBatches = numBatches || 3;
    const teamsPerBatch = Math.ceil(teams.length / _numBatches);
    
    // Shuffle teams for randomized grouping
    const shuffledTeams = teams.sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < _numBatches; i++) {
      const batchTeams = shuffledTeams.slice(i * teamsPerBatch, (i + 1) * teamsPerBatch);
      if (batchTeams.length > 0) {
        batches.push({
          batchNumber: i + 1,
          teams: batchTeams.map(t => t._id),
          notified: false,
          scheduledTime: new Date(new Date(startTime).getTime() + (i * (batchIntervalMinutes || 15) * 60000))
        });
      }
    }
    
    const meal = new Meal({
      name,
      startTime: new Date(startTime),
      batchIntervalMinutes: batchIntervalMinutes || 15,
      batches
    });
    
    await meal.save();
    
    res.status(201).json({ success: true, meal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMeals = async (req, res) => {
  try {
    const meals = await Meal.find().sort({ startTime: -1 }).populate('batches.teams', 'name college_name');
    res.status(200).json({ success: true, meals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
