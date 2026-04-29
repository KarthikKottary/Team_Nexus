const eventBus = require('../eventBus');

class EmergencyAgent {
  constructor() {
    this.listen();
    console.log('🛡️ EmergencyAgent initialized and listening.');
  }

  listen() {
    eventBus.on('new_alert', async (payload) => {
      console.log(`[EmergencyAgent] Analyzing alert: ${payload.type}`);
      if (['Fire', 'Medical', 'Security'].includes(payload.type)) {
        console.log(`🚨 [EmergencyAgent] CRITICAL EMERGENCY DETECTED`);
        
        // Command the NotificationAgent to broadcast immediately
        eventBus.emit('send_notification', {
          type: 'critical_broadcast',
          data: {
            title: `EVACUATION / CRITICAL: ${payload.type}`,
            message: `Location: ${payload.location}. Please follow emergency protocols immediately.`,
            timestamp: new Date()
          },
          logAction: 'GLOBAL_CRITICAL_ALERT_BROADCAST'
        });
      }
    });
  }
}

module.exports = new EmergencyAgent();
