const eventBus = require('../eventBus');
const Team = require('../../models/Team');

class ActivityAgent {
  constructor() {
    this.listen();
    console.log('📈 ActivityAgent initialized and listening.');
  }

  listen() {
    eventBus.on('github_activity', async (payload) => {
      const { teamId, commitCount } = payload;
      console.log(`[ActivityAgent] Analyzing github activity for team: ${teamId}`);
      
      if (commitCount && commitCount % 50 === 0) {
        eventBus.emit('send_notification', {
          type: 'milestone_reached',
          data: {
            teamId,
            message: `Team has reached ${commitCount} commits! Great job!`,
          }
        });
      }
    });

    eventBus.on('inactivity_detected', async (payload) => {
      const { teamId, idleHours } = payload;
      console.log(`⚠️ [ActivityAgent] Team ${teamId} inactive for ${idleHours} hours.`);
      
      await Team.findByIdAndUpdate(teamId, { status: 'inactive' });
      
      eventBus.emit('send_notification', {
        type: 'inactivity_warning',
        data: {
          teamId,
          message: `Warning: No commits detected in ${idleHours} hours.`,
        },
        logAction: 'INACTIVITY_WARNING_SENT',
        logTeamId: teamId
      });
    });

    eventBus.on('deadline_near', async (payload) => {
      console.log(`⏱️ [ActivityAgent] Deadline is near!`);
      eventBus.emit('send_notification', {
        type: 'deadline_warning',
        data: {
          message: 'Only 1 hour left! Please push your final commits to GitHub.',
          timeLeft: '1 hour'
        }
      });
    });
  }
}

module.exports = new ActivityAgent();
