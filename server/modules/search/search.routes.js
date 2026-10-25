import { authMiddleware } from '../auth/auth.middleware.js';
import { requireFullAccess } from '../../shared/middleware/require-full-access.middleware.js';
import { searchCandidatesHandler } from './search.controller.js';

export default async function searchRoutes(fastify) {
  fastify.get(
    '/api/v1/search',
    { preHandler: [authMiddleware, requireFullAccess] },
    searchCandidatesHandler
  );
}