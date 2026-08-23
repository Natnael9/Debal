import { getRedisClient } from '../../config/redis.js';

function authRateLimiter({ windowSeconds = 15 * 60, maxRequests = 10 } = {}) {
  return async function rateLimitHook(request, reply) {
    try {
      const redisClient = getRedisClient();
      if (!redisClient || redisClient.status !== 'ready') return;

      const ip = request.ip;
      const key = `ratelimit:auth:${ip}`;

      const currentCount = await redisClient.incr(key);

      if (currentCount === 1) {
        await redisClient.expire(key, windowSeconds);
      }

      if (currentCount > maxRequests) {
        const ttl = await redisClient.ttl(key);
        reply.header('Retry-After', ttl > 0 ? ttl : windowSeconds);
        return reply.code(429).send({
          error: 'Too many requests. Please try again later.',
        });
      }
    } catch (err) {
      request.log.warn({ err }, '[auth-rate-limit] Redis unavailable, bypassing rate limit check');
    }
  };
}

export { authRateLimiter };