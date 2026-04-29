const eventBus = require('../eventBus');
const Notification = require('../../models/Notification');

class NotificationAgent {
  constructor() {
    this.io = null;
    this.listen();
    console.log('🔔 NotificationAgent initialized and listening.');
  }

  setSocketIo(io) {
    this.io = io;
  }

  listen() {
    eventBus.on('send_notification', async (payload) => {
      console.log(`[NotificationAgent] Dispatching notification type: ${payload.type}`);
      
      // 1. Broadcast via Socket.io
      if (this.io) {
        this.io.emit(payload.type, payload.data);
      } else {
        console.warn('[NotificationAgent] Socket.io not initialized, missed broadcast.');
      }

      // 2. Log to Database if required
      if (payload.logAction) {
        try {
          await Notification.create({
            team_id: payload.logTeamId || null,
            action: payload.logAction,
          });
          console.log(`[NotificationAgent] Logged action to DB: ${payload.logAction}`);
        } catch (err) {
          console.error(`[NotificationAgent] Error logging notification:`, err);
        }
      }
    });
  }
}

module.exports = new NotificationAgent();
