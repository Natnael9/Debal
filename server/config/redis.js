import Redis from 'ioredis';

let redisClient = null;

export async function connectRedis() {
  const url = process.env.REDIS_URL;
  const isTls = url?.startsWith('rediss://');

  let hostname = '';
  try {
    hostname = new URL(url).hostname;
  } catch (err) {
    // Ignore invalid URL parsing fallback
  }

  redisClient = new Redis(url, {
    maxRetriesPerRequest: 1,
    lazyConnect: true,
    enableOfflineQueue: false,
    connectTimeout: 2000,
    keepAlive: 5000,
    retryStrategy: (times) => {
      if (times > 3) return null; // stop retrying quickly
      return Math.min(times * 300, 1000);
    },
    ...(isTls && { tls: { servername: hostname, rejectUnauthorized: false } }),
  });

  redisClient.on('error', (err) => {
    console.error('[redis] connection error:', err.message);
  });

  try {
    await redisClient.connect();
    await redisClient.ping();
    console.log('[redis] connected');
  } catch (err) {
    console.warn(`[redis] Warning: Failed to connect to Redis (${err.message}). Continuing without Redis.`);
  }

  return redisClient;
}

export function getRedisClient() {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call connectRedis() first.');
  }
  return redisClient;
}

export async function isRedisHealthy() {
  if (!redisClient || redisClient.status !== 'ready') return false;
  try {
    const pong = await Promise.race([
      redisClient.ping(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 200)),
    ]);
    return pong === 'PONG';
  } catch {
    return false;
  }
}

export async function disconnectRedis() {
  if (redisClient) {
    await redisClient.quit();
  }
}