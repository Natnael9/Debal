import Redis from 'ioredis';

let redisClient = null;

export async function connectRedis() {
  const url = process.env.REDIS_URL;


  const isTls = url?.startsWith('rediss://');

  redisClient = new Redis(url, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    ...(isTls && { tls: { rejectUnauthorized: false } }), 
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