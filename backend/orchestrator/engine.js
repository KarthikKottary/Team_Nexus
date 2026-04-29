const eventBus = require('./eventBus');

// Initialize agents (they auto-subscribe upon require)
require('./agents/EmergencyAgent');
require('./agents/ActivityAgent');
const notificationAgent = require('./agents/NotificationAgent');

/**
 * The core rule engine proxy that routes system events into the multi-agent bus.
 */
class OrchestratorEngine {
  constructor() {
    this.io = null; // Will be injected on server start
  }

  setSocketIo(io) {
    this.io = io;
    notificationAgent.setSocketIo(io);
  }

  async processEvent(eventType, payload) {
    console.log(`[Orchestrator] Routing Event to Agents: ${eventType}`);
    try {
      // Proxy external events (from Redis or API) into the internal multi-agent event bus
      eventBus.emit(eventType, payload);
    } catch (err) {
      console.error(`[Orchestrator] Error processing ${eventType}:`, err);
    }
  }
}

const engine = new OrchestratorEngine();
module.exports = engine;
