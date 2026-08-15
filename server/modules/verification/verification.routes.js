import { authMiddleware } from '../auth/auth.middleware.js';
import { submitVerificationHandler } from './verification.controller.js';

export default async function verificationRoutes(fastify) {
  fastify.post(
    '/api/v1/verification/submit',
    { preHandler: authMiddleware },
    submitVerificationHandler
  );
}