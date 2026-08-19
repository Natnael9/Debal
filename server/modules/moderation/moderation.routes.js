import { requireAdmin } from '../admin/admin.middleware.js';
import { listFlaggedPhotosHandler, decidePhotoReviewHandler } from './moderation.controller.js';

export default async function moderationRoutes(fastify) {
  fastify.get(
    '/api/v1/admin/photo-review',
    { preHandler: requireAdmin },
    listFlaggedPhotosHandler
  );

  fastify.patch(
    '/api/v1/admin/photo-review/:userId',
    { preHandler: requireAdmin },
    decidePhotoReviewHandler
  );
}