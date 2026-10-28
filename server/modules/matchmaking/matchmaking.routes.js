import { authMiddleware } from '../auth/auth.middleware.js';
import { requireQuestionnaireCompleted } from '../../shared/middleware/require-full-access.middleware.js';
import {
  getMatchFeedHandler,
  sendMatchRequestHandler,
  respondToMatchRequestHandler,
} from './matchmaking.controller.js';

export default async function matchmakingRoutes(fastify) {
  fastify.get(
    '/api/v1/matches/feed',
    { preHandler: [authMiddleware, requireQuestionnaireCompleted] },
    getMatchFeedHandler
  );

  fastify.post(
    '/api/v1/matches/request/:userId',
    { preHandler: [authMiddleware, requireQuestionnaireCompleted] },
    sendMatchRequestHandler
  );

  fastify.post(
    '/api/v1/matches/respond/:requestId',
    { preHandler: [authMiddleware, requireQuestionnaireCompleted] },
    respondToMatchRequestHandler
  );
}
