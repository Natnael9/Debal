import { authMiddleware } from '../auth/auth.middleware.js';
import { requireAdmin } from '../admin/admin.middleware.js';
import {
  submitVerificationHandler,
  confirmOtpHandler,
  listPendingReviewHandler,
  getVerificationDetailHandler,
  decideVerificationHandler,
} from './verification.controller.js';

export default async function verificationRoutes(fastify) {
  fastify.post(
    '/api/v1/verification/submit',
    { preHandler: authMiddleware },
    submitVerificationHandler
  );

  fastify.post(
    '/api/v1/verification/confirm-otp',
    { preHandler: authMiddleware },
    confirmOtpHandler
  );

  fastify.get(
    '/api/v1/admin/verifications',
    { preHandler: requireAdmin },
    listPendingReviewHandler
  );

  fastify.get(
    '/api/v1/admin/verifications/:id',
    { preHandler: requireAdmin },
    getVerificationDetailHandler
  );

  fastify.patch(
    '/api/v1/admin/verifications/:id',
    { preHandler: requireAdmin },
    decideVerificationHandler
  );
}