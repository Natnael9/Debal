import { authMiddleware } from '../auth/auth.middleware.js';
import { submitVerificationHandler, confirmOtpHandler } from './verification.controller.js';

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
}