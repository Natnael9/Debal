import { authMiddleware } from '../auth/auth.middleware.js';
import { getMatchFeedHandler } from './matchmaking.controller.js';

export default async function matchmakingRoutes(fastify) {
  fastify.get(
    '/api/v1/matches/feed',
    { preHandler: authMiddleware },
    getMatchFeedHandler
  );
}