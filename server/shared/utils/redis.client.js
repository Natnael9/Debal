import Redis from 'ioredis';

// Single shared Redis connection (managed Redis, per architecture doc §11.1).
// REDIS_URL comes from .env — ask Robel if it's not in your .env yet
// (it's set up as part of his "Env & DB connection" task today).
const redisClient = new Redis(process.env.REDIS_URL);

redisClient.on('error', (err) => {
  console.error('[redis] connection error:', err.message);
});

export default redisClient;