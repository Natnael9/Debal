import { authMiddleware } from '../auth/auth.middleware.js';
import { searchCandidatesHandler } from './search.controller.js';

export default async function searchRoutes(fastify) {
  fastify.get(
    '/api/v1/search',
    { preHandler: authMiddleware },
    searchCandidatesHandler
  );
}