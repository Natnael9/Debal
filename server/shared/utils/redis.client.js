import Redis from 'ioredis';

// Single shared Redis connection (managed Redis, per architecture doc §11.1).
const url = process.env.REDIS_URL;
const isTls = url?.startsWith('rediss://');
let hostname = '';
try {
  hostname = new URL(url).hostname;
} catch (err) {}

const redisClient = new Redis(url, {
  ...(isTls && { tls: { servername: hostname, rejectUnauthorized: false } }),
});

redisClient.on('error', (err) => {
  console.error('[redis] connection error:', err.message);
});

export default redisClient;