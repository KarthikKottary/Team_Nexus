const Redis = require('ioredis');

// Fallback to a mock redis if no redis server is actually running locally,
// ensuring the app doesn't crash in local dev without docker.
let pub, sub;

try {
  const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
  
  pub = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    retryStrategy(times) {
      if (times > 3) return null; // stop retrying
      return Math.min(times * 50, 2000);
    }
  });

  sub = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    retryStrategy(times) {
      if (times > 3) return null;
      return Math.min(times * 50, 2000);
    }
  });

  pub.on('error', () => { /* Suppress error in dev without Redis */ });
  sub.on('error', () => { /* Suppress error in dev without Redis */ });

} catch (e) {
  console.log('Redis not connected, using fallback pubsub for orchestrator');
}

/**
 * Emit an event to the orchestrator
 */
const emitEvent = (eventType, payload) => {
  if (pub && pub.status === 'ready') {
    pub.publish('orchestrator_events', JSON.stringify({ eventType, payload, timestamp: Date.now() }));
  } else {
    // Local fallback for when Redis isn't running
    const engine = require('./engine');
    engine.processEvent(eventType, payload);
  }
};

module.exports = { pub, sub, emitEvent };
