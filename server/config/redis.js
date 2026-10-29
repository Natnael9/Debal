// Redis is commented out for now as requested.
// Upstash free limit exceeded; the app gracefully runs with MongoDB and in-memory caches.

let redisClient = null;

export async function connectRedis() {
  console.log('[redis] Redis is disabled/commented out for now.');
  return null;
}

export function getRedisClient() {
  return null;
}

export function isRedisHealthy() {
  return false;
}

export async function disconnectRedis() {
  // no-op
}
