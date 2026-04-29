const Team = require('../models/Team');

exports.getPredictions = async (req, res) => {
  try {
    const teams = await Team.find({ status: { $in: ['active', 'idle'] } });
    
    if (!teams || teams.length === 0) {
      return res.status(200).json({ success: true, topPerformers: [], atRiskTeams: [] });
    }

    const now = new Date();
    
    // Calculate global averages
    const totalCommits = teams.reduce((acc, team) => acc + (team.recentCommits?.length || 0), 0);
    const avgCommits = totalCommits / teams.length;

    const totalScore = teams.reduce((acc, team) => acc + (team.scores?.total || 0), 0);
    const avgScore = totalScore / teams.length;

    const topPerformers = [];
    const atRiskTeams = [];

    teams.forEach(team => {
      const commitCount = team.recentCommits?.length || 0;
      const score = team.scores?.total || 0;
      
      let hoursSinceLastCommit = 999;
      if (team.lastCommitAt) {
        hoursSinceLastCommit = (now - new Date(team.lastCommitAt)) / (1000 * 60 * 60);
      }

      // ----------------------------------------------------
      // PREDICTION RULE 1: Top Performers
      // - Commit volume is 50% above average AND
      // - Score is above average AND
      // - Active within the last 3 hours
      // ----------------------------------------------------
      if (commitCount > avgCommits * 1.5 && score >= avgScore && hoursSinceLastCommit < 3) {
        topPerformers.push({
          teamId: team._id,
          name: team.name,
          reason: `High velocity (${commitCount} commits) & strong score (${score}).`,
        });
      }

      // ----------------------------------------------------
      // PREDICTION RULE 2: At-Risk Teams
      // - No commits in the last 6 hours OR
      // - Total score is zero or significantly below average while others are scoring
      // ----------------------------------------------------
      let riskReasons = [];
      if (hoursSinceLastCommit > 6) {
        riskReasons.push(`Inactive for ${Math.floor(hoursSinceLastCommit)} hours.`);
      }
      if (avgScore > 10 && score < avgScore * 0.3) {
        riskReasons.push(`Score is critically below average (${score} vs ${Math.round(avgScore)}).`);
      }

      if (riskReasons.length > 0) {
        atRiskTeams.push({
          teamId: team._id,
          name: team.name,
          reason: riskReasons.join(' '),
        });
      }
    });

    res.status(200).json({
      success: true,
      data: {
        avgCommits: Math.round(avgCommits),
        avgScore: Math.round(avgScore),
        topPerformers,
        atRiskTeams
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
