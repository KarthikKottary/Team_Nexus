const cron = require('node-cron');
const Team = require('../models/Team');
const Meal = require('../models/Meal');
const Notice = require('../models/Notice');
const { emitEvent } = require('./redis');

// In-memory reference for socket.io since scheduler needs to emit events
let ioRef = null;

const setSchedulerIo = (io) => {
  ioRef = io;
};

/**
 * Initializes cron jobs to trigger scheduled orchestrator events
 */
const initScheduler = () => {
  console.log('🕒 Orchestrator Scheduler Initialized');

  // Inactivity Check: Every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    try {
      const teams = await Team.find({ status: { $in: ['active', 'idle'] } });
      const now = new Date();
      
      for (const team of teams) {
        if (!team.lastCommitAt) continue;
        
        const diffHours = (now - team.lastCommitAt) / (1000 * 60 * 60);
        
        if (diffHours >= 2) {
          // Broadcast inactivity warning
          const notice = new Notice({
            title: `Inactivity Warning`,
            message: `Your team hasn't committed any code in over 2 hours. Please push your changes!`,
            targetRole: 'participant',
            phase: 'hacking',
            priority: 'urgent',
            targetTeams: [team._id]
          });
          await notice.save();
          if (ioRef) ioRef.emit('new_notice', notice);

          emitEvent('inactivity_detected', { 
            teamId: team._id, 
            idleHours: Math.floor(diffHours) 
          });
        }
      }
    } catch (err) {
      console.error('Inactivity Scheduler error:', err);
    }
  });

  // Checkpoints Tracker: Every minute
  const Checkpoint = require('../models/Checkpoint');
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const checkpoints = await Checkpoint.find({ active: true });
      
      for (const cp of checkpoints) {
        const timeDiffMs = cp.deadline.getTime() - now.getTime();
        const minutesUntil = timeDiffMs / 60000;

        // Auto reminder: 30 minutes before deadline
        if (minutesUntil <= 30 && minutesUntil > 0 && !cp.notifiedWarning) {
          const notice = new Notice({
             title: `Checkpoint Upcoming: ${cp.title}`,
             message: `The checkpoint "${cp.title}" is due in ${Math.ceil(minutesUntil)} minutes!`,
             targetRole: 'all',
             phase: 'hacking',
             priority: 'high'
          });
          await notice.save();
          if (ioRef) ioRef.emit('new_notice', notice);
          
          cp.notifiedWarning = true;
          await cp.save();
        }

        // Missed checkpoint logic
        if (minutesUntil <= 0 && !cp.notifiedMissed) {
          const teams = await Team.find({ completedCheckpoints: { $ne: cp._id }, status: 'active' });
          const targetTeamIds = teams.map(t => t._id);

          if (targetTeamIds.length > 0) {
            const notice = new Notice({
               title: `Missed Checkpoint: ${cp.title}`,
               message: `You missed the deadline for "${cp.title}". Please submit immediately to avoid penalties.`,
               targetRole: 'participant',
               phase: 'hacking',
               priority: 'urgent',
               targetTeams: targetTeamIds
            });
            await notice.save();
            if (ioRef) ioRef.emit('new_notice', notice);
          }
          
          cp.notifiedMissed = true;
          await cp.save();
        }
      }
    } catch (err) {
      console.error('Checkpoint Scheduler Error:', err);
    }
  });

  // Refreshment / Break Management Scheduler - runs every minute
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      // Find meals that are scheduled or active
      const activeMeals = await Meal.find({ status: { $in: ['scheduled', 'active'] } });
      
      for (const meal of activeMeals) {
         let allNotified = true;
         let updated = false;

         for (const batch of meal.batches) {
           // If time has passed and batch hasn't been notified yet
           if (!batch.notified && now >= batch.scheduledTime) {
              batch.notified = true;
              updated = true;
              
              // Create a Notice for these specific teams
              const notice = new Notice({
                title: `${meal.name} - Batch ${batch.batchNumber}`,
                message: `Your batch is now invited for ${meal.name.toLowerCase()}! Please proceed to the refreshment area.`,
                targetRole: 'participant',
                phase: 'general',
                priority: 'high',
                targetTeams: batch.teams
              });
              
              await notice.save();

              // Broadcast notice directly via ioRef if available
              if (ioRef) {
                ioRef.emit('new_notice', notice);
              }
           }
           if (!batch.notified) {
             allNotified = false;
           }
         }
         
         if (updated) {
           if (allNotified) {
             meal.status = 'completed';
           } else if (meal.status === 'scheduled') {
             meal.status = 'active';
           }
           await meal.save();
         }
      }
    } catch (err) {
      console.error('Meal Scheduler Error:', err);
    }
  });

};

module.exports = { initScheduler, setSchedulerIo };
