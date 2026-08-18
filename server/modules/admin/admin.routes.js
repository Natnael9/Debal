import { login } from './admin.controller.js';
import { getRedisClient } from '../../config/redis.js';

/**
 * Self-contained rate limiter, scoped only to admin login.
 * Deliberately NOT reusing shared/middleware/rate-limiter.middleware.js
 * to avoid touching a file other in-flight work might also be editing —
 * this keeps a distinct Redis key so admin-login attempts are never
 * shared with (or exhausted by) the regular auth rate limiter.
 * Tighter limit per architecture doc §12.2: 5 requests / 15 min per IP,
 * since admin login is a higher-value target.
 */
function adminLoginRateLimit({ windowSeconds = 15 * 60, maxRequests = 5 } = {}) {
  return async function rateLimitHook(request, reply) {
    const redisClient = getRedisClient();
    const key = `ratelimit:admin-auth:${request.ip}`;

    const currentCount = await redisClient.incr(key);
    if (currentCount === 1) {
      await redisClient.expire(key, windowSeconds);
    }

    if (currentCount > maxRequests) {
      const ttl = await redisClient.ttl(key);
      reply.header('Retry-After', ttl > 0 ? ttl : windowSeconds);
      return reply.code(429).send({
        success: false,
        error: 'RATE_LIMITED',
        message: 'Too many admin login attempts. Please try again later.',
      });
    }
  };
}

export default async function adminRoutes(fastify) {
  fastify.post(
    '/api/v1/admin/auth/login',
    { preHandler: adminLoginRateLimit() },
    login
  );
}