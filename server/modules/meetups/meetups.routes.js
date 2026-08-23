import { authMiddleware } from '../auth/auth.middleware.js';
import { requireFullAccess } from '../../shared/middleware/require-full-access.middleware.js';
import {
  proposeMeetupHandler,
  respondToMeetupHandler,
  getCalendarLinkHandler,
  deleteMeetupHandler,
} from './meetups.controller.js';

export default async function meetupsRoutes(fastify) {
  fastify.post(
    '/api/v1/matches/:matchId/meetups',
    { preHandler: [authMiddleware, requireFullAccess] },
    proposeMeetupHandler
  );

  fastify.patch(
    '/api/v1/meetups/:id',
    { preHandler: [authMiddleware, requireFullAccess] },
    respondToMeetupHandler
  );

  fastify.get(
    '/api/v1/meetups/:id/calendar-link',
    { preHandler: [authMiddleware, requireFullAccess] },
    getCalendarLinkHandler
  );

  fastify.delete(
    '/api/v1/meetups/:id',
    { preHandler: [authMiddleware, requireFullAccess] },
    deleteMeetupHandler
  );
}