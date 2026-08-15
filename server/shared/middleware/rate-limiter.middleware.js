const redisClient = require('../utils/redis.client');

/**
 * Simple Redis-backed fixed-window rate limiter.
 * Satisfies FR-1.6 / architecture doc §10.3: 10 requests / 15 min per IP
 * on auth endpoints.
 *
 * Usage (Fastify):
 *   fastify.post('/register', { preHandler: authRateLimiter() }, controller.register);
 */
function authRateLimiter({ windowSeconds = 15 * 60, maxRequests = 10 } = {}) {
  return async function rateLimitHook(request, reply) {
    const ip = request.ip; // Fastify resolves this from the socket / trust proxy config
    const key = `ratelimit:auth:${ip}`;

    const currentCount = await redisClient.incr(key);

    if (currentCount === 1) {
      // First request in this window — start the TTL.
      await redisClient.expire(key, windowSeconds);
    }

    if (currentCount > maxRequests) {
      const ttl = await redisClient.ttl(key);
      reply.header('Retry-After', ttl > 0 ? ttl : windowSeconds);
      return reply.code(429).send({
        error: 'Too many requests. Please try again later.',
      });
    }
  };
}

module.exports = { authRateLimiter };