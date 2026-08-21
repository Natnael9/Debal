import { authMiddleware } from '../auth/auth.middleware.js';
import {
  submitQuestionnaireHandler,
  updateProfileHandler,
  getUserProfileByIdHandler,
} from './users.controller.js';

export default async function usersRoutes(fastify) {
  fastify.get(
    '/api/v1/users/me',
    { preHandler: authMiddleware },
    async (request, reply) => {
      return reply.send({ success: true, data: { user: request.user } });
    }
  );

  fastify.get(
    '/api/v1/users/:id',
    { preHandler: authMiddleware },
    getUserProfileByIdHandler
  );

  fastify.post(
    '/api/v1/onboarding/questionnaire',
    { preHandler: authMiddleware },
    submitQuestionnaireHandler
  );

  fastify.patch(
    '/api/v1/users/me',
    { preHandler: authMiddleware },
    updateProfileHandler
  );
}