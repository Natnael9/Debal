import { authMiddleware } from '../auth/auth.middleware.js';
import { assertUserInMatch, getMessages } from './chat.service.js';

export default async function chatRoutes(fastify) {
  fastify.get(
    '/api/v1/matches/:matchId/messages',
    { preHandler: authMiddleware },
    async (request, reply) => {
      const { matchId } = request.params;
      const { before, limit } = request.query;

      try {
        await assertUserInMatch(request.user._id, matchId);
        const messages = await getMessages(matchId, {
          before,
          limit: limit ? parseInt(limit, 10) : 50,
        });

        return reply.send({ success: true, data: { messages } });
      } catch (err) {
        if (err.code === 'MATCH_NOT_FOUND') {
          return reply.status(404).send({ success: false, error: err.code });
        }
        if (err.code === 'NOT_MATCH_PARTICIPANT') {
          return reply.status(403).send({ success: false, error: err.code });
        }
        request.log.error(err);
        return reply.status(500).send({ success: false, error: 'INTERNAL_ERROR' });
      }
    }
  );
}