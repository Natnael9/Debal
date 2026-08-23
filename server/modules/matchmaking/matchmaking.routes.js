import { authMiddleware } from '../auth/auth.middleware.js';
import { requireFullAccess } from '../../shared/middleware/require-full-access.middleware.js';
import {
  getMatchFeedHandler,
  sendMatchRequestHandler,
  respondToMatchRequestHandler,
} from './matchmaking.controller.js';

export default async function matchmakingRoutes(fastify) {
  fastify.get(
    '/api/v1/matches/feed',
    { preHandler: [authMiddleware, requireFullAccess] },
    getMatchFeedHandler
  );

    fastify.post(
    '/api/v1/matches/request/:userId',
    { preHandler: [authMiddleware, requireFullAccess] },
    sendMatchRequestHandler
  );

  fastify.post(
    '/api/v1/matches/respond/:requestId',
    { preHandler: [authMiddleware, requireFullAccess] },
    respondToMatchRequestHandler
  );
}