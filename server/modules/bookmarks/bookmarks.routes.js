import { authMiddleware } from '../auth/auth.middleware.js';
import { requireFullAccess } from '../../shared/middleware/require-full-access.middleware.js';
import {
  addBookmarkHandler,
  listBookmarksHandler,
  removeBookmarkHandler,
} from './bookmarks.controller.js';

export default async function bookmarksRoutes(fastify) {
  fastify.post(
    '/api/v1/bookmarks',
    { preHandler: [authMiddleware, requireFullAccess] },
    addBookmarkHandler
  );

  fastify.get(
    '/api/v1/bookmarks',
    { preHandler: [authMiddleware, requireFullAccess] },
    listBookmarksHandler
  );

  fastify.delete(
    '/api/v1/bookmarks/:bookmarkedUserId',
    { preHandler: [authMiddleware, requireFullAccess] },
    removeBookmarkHandler
  );
}