import { authMiddleware } from '../auth/auth.middleware.js';

export default async function usersRoutes(fastify) {
  fastify.get(
    '/api/v1/users/me',
    { preHandler: authMiddleware },
    async (request, reply) => {
      return reply.send({ success: true, data: { user: request.user } });
    }
  );
}