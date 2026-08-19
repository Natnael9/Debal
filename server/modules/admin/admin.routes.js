import { login } from './admin.controller.js';
import { requireAdmin } from './admin.middleware.js';
import { getRedisClient } from '../../config/redis.js';
import {
  listPendingReviewHandler,
  getVerificationDetailHandler,
  decideVerificationHandler,
} from '../verification/verification.controller.js';
import { getAdminStats, getAuditLogs } from './admin-stats.controller.js';
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
  // -------------------------------------------------------------------------
  // POST /api/v1/admin/auth/login   (FR-12.2, §12.2)
  // Separate rate-limit key from regular auth so admin attempts are never
  // shared with or exhausted by user-facing auth rate limits.
  // -------------------------------------------------------------------------
  fastify.post(
    '/api/v1/admin/auth/login',
    { preHandler: adminLoginRateLimit() },
    login
  );

  // -------------------------------------------------------------------------
  // GET /api/v1/admin/verifications?status=pending_review   (FR-2.7, FR-12.2)
  //
  // Query params:
  //   status  — pending_review (default) | matched | no_match
  //   page    — 1-based page (default: 1)
  //   limit   — per-page count, max 100 (default: 20)
  //
  // Requires: admin-role JWT (§12.2). Every call is audit-logged (§13.3).
  // -------------------------------------------------------------------------
  fastify.get(
    '/api/v1/admin/verifications',
    {
      preHandler: requireAdmin,
      schema: {
        querystring: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['pending_review', 'matched', 'no_match'],
              default: 'pending_review',
            },
            page:  { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          },
        },
      },
    },
    listPendingReviewHandler
  );

  // -------------------------------------------------------------------------
  // GET /api/v1/admin/verifications/:id   (FR-2.7, FR-12.2, §13.3)
  //
  // Returns decrypted identity (name, dateOfBirth) alongside all
  // verification request metadata. Audit-logged on every access.
  // Requires: admin-role JWT (§12.2).
  // -------------------------------------------------------------------------
  fastify.get(
    '/api/v1/admin/verifications/:id',
    { preHandler: requireAdmin },
    getVerificationDetailHandler
  );

  // -------------------------------------------------------------------------
  // PATCH /api/v1/admin/verifications/:id   (FR-2.7, FR-12.2, §13.3)
  //
  // Body: { decision: 'approve' | 'reject', notes?: string }
  // Updates verificationRequest.result and writes to admin_actions.
  // Requires: admin-role JWT (§12.2).
  // -------------------------------------------------------------------------
  fastify.patch(
    '/api/v1/admin/verifications/:id',
    {
      preHandler: requireAdmin,
      schema: {
        body: {
          type: 'object',
          required: ['decision'],
          properties: {
            decision: { type: 'string', enum: ['approve', 'reject'] },
            notes:    { type: 'string', maxLength: 1000 },
          },
        },
      },
    },
    decideVerificationHandler
  );


  // -------------------------------------------------------------------------
  // STATS & AUDIT LOG ENDPOINTS
  // -------------------------------------------------------------------------

  // GET /api/v1/admin/stats - Dashboard summary metrics[cite: 3]
  fastify.get(
    '/api/v1/admin/stats',
    { preHandler: requireAdmin },
    getAdminStats
  );

  // GET /api/v1/admin/audit-logs - Filterable activity history[cite: 3]
  fastify.get(
    '/api/v1/admin/audit-logs',
    { preHandler: requireAdmin },
    getAuditLogs
  );
}