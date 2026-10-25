import { blockUser, unblockUser } from './blocks.controller.js';
import { authMiddleware } from '../auth/auth.middleware.js';

export default async function blocksRoutes(fastify, options) {
  // POST /blocks/:userId - Block a user
  fastify.post('/:userId', { preHandler: [authMiddleware] }, blockUser);
  
  // DELETE /blocks/:userId - Unblock a user
  fastify.delete('/:userId', { preHandler: [authMiddleware] }, unblockUser);
}