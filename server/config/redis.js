import Redis from 'ioredis';
import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (err) {
  // Ignore DNS setServers error
}

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
    family: 4,
    retryStrategy: (times) => {
      if (times > 5) return null; 
      return Math.min(times * 500, 3000); 
    },
    ...(isTls && { tls: { servername: hostname, rejectUnauthorized: false } }),
  });

  redisClient.on('error', (err) => {
    console.error('[redis] connection error:', err.message);
  });

  await redisClient.connect();
  await redisClient.ping();

  console.log('[redis] connected');

  return redisClient;
}

export function getRedisClient() {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call connectRedis() first.');
  }
  return redisClient;
}

export async function isRedisHealthy() {
  try {
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