const Team = require('../models/Team');

// Ranking logic and Insight generation
exports.getLeaderboard = async (req, res) => {
  try {
    const teams = await Team.find({ status: 'active' }).populate('members', 'name');

    // 1. Ranking Logic
    const rankedTeams = teams
      .map(team => ({
        _id: team._id,
        name: team.name,
        college_name: team.college_name,
        scores: team.scores,
        recentCommitsCount: team.recentCommits?.length || 0,
        scoreHistory: team.scoreHistory || []
      }))
      .sort((a, b) => b.scores.total - a.scores.total);

    // 2. Insight Generation
    let mostActiveTeam = null;
    let risingTeam = null;

    if (rankedTeams.length > 0) {
      // Most Active Team: based on recentCommits count
      mostActiveTeam = [...rankedTeams].sort((a, b) => b.recentCommitsCount - a.recentCommitsCount)[0];
      
      // Rising Team: greatest positive change in score over recent history
      let maxGrowth = -1;
      rankedTeams.forEach(team => {
        if (team.scoreHistory && team.scoreHistory.length >= 2) {
          // Compare latest score with oldest score in history (or previous)
          const latest = team.scoreHistory[team.scoreHistory.length - 1].total;
          const oldest = team.scoreHistory[0].total;
          const growth = latest - oldest;
          if (growth > maxGrowth) {
            maxGrowth = growth;
            risingTeam = team;
          }
        }
      });
      // Fallback if no history yet
      if (!risingTeam && rankedTeams.length > 1) {
        risingTeam = rankedTeams[1]; // just pick the runner up if no history exists for a demo
      }
    }

    res.status(200).json({
      success: true,
      leaderboard: rankedTeams,
      insights: {
        mostActiveTeam: mostActiveTeam ? { name: mostActiveTeam.name, commits: mostActiveTeam.recentCommitsCount } : null,
        risingTeam: risingTeam ? { name: risingTeam.name } : null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTeamScore = async (req, res) => {
  try {
    const { id } = req.params;
    const { innovation, technical, impact } = req.body;
    
    const team = await Team.findById(id);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    const newTotal = (innovation || 0) + (technical || 0) + (impact || 0);

    // Save current total to history before updating if it changed
    if (team.scores.total !== newTotal) {
      team.scoreHistory.push({ total: team.scores.total });
    }

    team.scores = {
      innovation: innovation || 0,
      technical: technical || 0,
      impact: impact || 0,
      total: newTotal
    };

    await team.save();

    res.status(200).json({ success: true, team });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
