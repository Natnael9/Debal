import { authMiddleware } from '../auth/auth.middleware.js';
import {
  submitVerificationHandler,
  confirmOtpHandler,
  resendOtpHandler,
} from './verification.controller.js';

// User-facing (self-service) verification routes only.
// Admin-gated routes (list / view / decide) live in admin.routes.js.
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

  fastify.post(
    '/api/v1/verification/resend-otp',
    { preHandler: authMiddleware },
    resendOtpHandler
  );
}