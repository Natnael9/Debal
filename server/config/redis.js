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
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    connectTimeout: 20000,
    keepAlive: 10000,
    retryStrategy: (times) => {
      return Math.min(times * 500, 3000);
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
  if (!redisClient) return false;
  try {
    if (['end', 'close'].includes(redisClient.status)) {
      await redisClient.connect();
    }
    const pong = await redisClient.ping();
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