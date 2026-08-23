import './config/dns.js';
import 'dotenv/config';

import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';

import { connectDatabase, disconnectDatabase } from './config/database.js';
import { connectRedis, disconnectRedis } from './config/redis.js';
import healthRoute from './routes/health.route.js';
import authRoutes from './modules/auth/auth.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import verificationRoutes from './modules/verification/verification.routes.js';
import { initChatGateway } from './modules/chat/chat.gateway.js';
import chatRoutes from './modules/chat/chat.routes.js';
import meetupsRoutes from './modules/meetups/meetups.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import bookmarksRoutes from './modules/bookmarks/bookmarks.routes.js';
import searchRoutes from './modules/search/search.routes.js';
import { startModerationWorker } from './modules/moderation/moderation.worker.js';
import { startNotificationWorker } from './modules/notifications/notification.worker.js';
import matchmakingRoutes from './modules/matchmaking/matchmaking.routes.js';
import moderationRoutes from './modules/moderation/moderation.routes.js';
import googleOauthRoutes from './modules/auth/google-oauth.routes.js';
import reportRoutes from './modules/reports/reports.routes.js';
import blocksRoutes from './modules/reports/blocks.routes.js';
import uploadRoutes from './routes/upload.route.js';

const PORT = process.env.PORT || 4000;

async function start() {
  const fastify = Fastify({ 
    logger: true,
    bodyLimit: 15 * 1024 * 1024, // 15MB limit for image uploads
  });

  // Global User-Friendly Error Handler
  fastify.setErrorHandler((error, request, reply) => {
    request.log.error(error);

    // If a custom 4xx user error is thrown (e.g. 400 validation, 401 unauthenticated, 403 forbidden, 409 duplicate)
    if (error.statusCode && error.statusCode < 500) {
      return reply.status(error.statusCode).send({
        success: false,
        error: error.name || 'REQUEST_ERROR',
        message: error.message || 'Invalid request. Please check your inputs.',
      });
    }

    // Handle Mongo / DB Connection Failures Gracefully
    if (
      error.name === 'MongoServerSelectionError' ||
      error.name === 'MongoNetworkError' ||
      error.name === 'MongoTimeoutError' ||
      error.name === 'MongoNetworkTimeoutError'
    ) {
      return reply.status(503).send({
        success: false,
        error: 'SERVICE_UNAVAILABLE',
        message: 'The service is temporarily unavailable. Please try again in a few moments.',
      });
    }

    // Default 500 Internal Server Error (Never expose raw code stacks to user)
    return reply.status(500).send({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Something went wrong on our end. Please try again in a few moments.',
    });
  });

  await fastify.register(cors, {
    origin: true,
    credentials: true,
  });

  await fastify.register(cookie);

  await connectDatabase();
  await connectRedis();

  await fastify.register(healthRoute);
  await fastify.register(uploadRoutes);
  await fastify.register(authRoutes);
  await fastify.register(googleOauthRoutes);
  await fastify.register(usersRoutes);
  await fastify.register(verificationRoutes);
  await fastify.register(reportRoutes, { prefix: '/api/v1/reports' });
  await fastify.register(blocksRoutes, { prefix: '/api/v1/blocks' });
  await fastify.register(chatRoutes);
  await fastify.register(meetupsRoutes);
  await fastify.register(adminRoutes);
  await fastify.register(bookmarksRoutes);
  await fastify.register(searchRoutes);
  await fastify.register(matchmakingRoutes);
  await fastify.register(moderationRoutes);

  await fastify.listen({ port: PORT, host: '0.0.0.0' });
  console.log(`[server] listening on http://localhost:${PORT}`);
  initChatGateway(fastify.server);
  startNotificationWorker();
  startModerationWorker();

  const shutdown = async (signal) => {
    console.log(`[server] received ${signal}, shutting down`);
    await fastify.close();
    await disconnectDatabase();
    await disconnectRedis();
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start().catch((err) => {
  console.error('[server] failed to start:', err);
  process.exit(1);
});